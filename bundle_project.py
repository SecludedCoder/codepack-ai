# bundle_project.py
# !/usr/env/bin python3
# -*- coding: utf-8 -*-

# Version: 1.3.2 # Updated version to reflect dotfile handling fix
# Modified: 2025-06-28 # Date of dotfile logic correction
# Change: Corrected the logic for dotfile handling in INCLUDE_EXTENSIONS and EXCLUDE_EXTENSIONS.
# Change: Added INCLUDE_FULL_STRUCTURE_TREE option to control full structure output.
# Change: Added script execution directory path to the output header.
# Change: Updated header content description dynamically based on settings.
# Change: Added OUTPUT_MODE for different output formats (full, filtered struct, full struct).
# Change: Implemented timestamped and mode-specific output filenames.
# Change: Added standard script header comment.
# Change: Added optional processing of .gitignore file.

"""
Scans a project directory, optionally filters files based on specified rules,
and bundles the content of selected files into a single text output
suitable for pasting into Large Language Models (LLMs).

Supports different output modes:
- Mode 1: Full bundle (structure trees + file content).
- Mode 2: Filtered structure tree only.
- Mode 3: Full scanned structure tree only.

Allows optional inclusion of the full (unfiltered) structure tree.
Outputs the script's execution directory path in the header.
Optionally processes .gitignore at the project root to extend exclusion rules.

The output starts with a very prominent separator and explanation, followed by:
- The content specified by the selected OUTPUT_MODE and configuration.

Uses a two-stage filtering logic after initial exclusion checks:
1. Determines an 'initial scope' based on INCLUDE_FILES and INCLUDE_SUBDIRS.
2. Applies INCLUDE_EXTENSIONS as a filter to the files within that scope.
"""

import os
import io
from pathlib import Path
import sys
from typing import List, Dict, Any, Optional, Tuple, Union, Set
import datetime  # Added for timestamping

# ==============================================================================
# 用户配置区域 - 请在此处修改参数
# ==============================================================================
# --- 基本设置 ---

# 1. 根目录 (Root Directory)
#    项目文件的根目录绝对路径。留空 ("") 或 None 则使用脚本所在目录。
#    Windows 示例: r"C:\Users\YourName\ProjectFolder"
ROOT_DIR: Optional[str] = ""

# 2. 输出文件名 (Output Filename Base)
#    合并后内容保存的文件名的基础部分 (在脚本目录下)。
#    - 如果设置 (e.g., "my_bundle.txt", "project_data"), 将根据 OUTPUT_MODE 和时间戳生成最终文件名。
#      (e.g., "my_bundle_20250421230925.txt", "project_data_filtered_structure_20250421230925.txt")
#    - 如果留空 ("") 或 None, 则将结果打印到控制台，不生成文件。
#    - 如果提供了扩展名，会使用它；否则默认为 '.txt'。
OUTPUT_FILENAME: Optional[str] = "gemini_project_bundle.txt"

# 3. 输出模式 (Output Mode)
#    控制脚本生成哪种类型的输出。
#    - 1: (默认) 完整捆绑包 - 包含头部、可选的完整结构树、过滤后结构树、摘要头(可选)、包含的文件内容。
#    - 2: 仅过滤后结构 - 仅包含头部和过滤后的文件结构树 (显示会被包含的文件)。
#    - 3: 仅完整结构 - 仅包含头部和可选的扫描到的完整项目结构树 (仅应用目录排除规则)。
OUTPUT_MODE: int = 1  # 1 = Full Bundle, 2 = Filtered Structure Only, 3 = Full Structure Only

# 4. 是否包含完整结构树 (Include Full Structure Tree)
#    控制是否在输出中包含“完整的”项目结构树 (仅应用 EXCLUDE_DIRS 规则)。
#    此选项仅在 OUTPUT_MODE 为 1 或 3 时生效。
#    - True: (默认) 在 Mode 1 和 3 的输出中包含完整的结构树。
#    - False: 在任何模式下都不包含完整的结构树。
INCLUDE_FULL_STRUCTURE_TREE: bool = True

# --- 筛选规则优先级与逻辑说明 (重要!) ---
# 文件是否被最终包含 (用于 Mode 1 和 Mode 2)，遵循以下 **严格顺序** 的判断逻辑：
#
# 1. **硬编码排除 (强制最高优先级)**:
#    - 文件名是否为脚本自身名称?
#    - 文件名是否与原始 OUTPUT_FILENAME 配置匹配? (防止覆盖自身)
#    - 如果 **是** -> 文件被 **立即强制排除**，处理结束。
#    - 如果 **否** -> 进入步骤 2。
#
# 2. **配置排除检查 (次高优先级)**:
#    - 文件是否匹配 *任何* 一条 `EXCLUDE_*` 规则 (`EXCLUDE_DIRS`, `EXCLUDE_FILES`, `EXCLUDE_EXTENSIONS`)？
#    - (如果启用) 文件是否匹配从 `.gitignore` 加载的规则？
#    - 如果 **是** -> 文件被 **立即排除**，处理结束。
#    - 如果 **否** -> 进入步骤 3。
#
# 3. **初始作用域确定 (基于 FILES/SUBDIRS)**:
#    - 查看 `INCLUDE_FILES` 和 `INCLUDE_SUBDIRS` 是否 **都为空**？
#      - 如果 **是** -> 该文件的 "初始作用域" 被视为 **包含**。进入步骤 4。
#      - 如果 **否** ->
#        - 文件是否匹配 `INCLUDE_FILES` 中的 **至少一个** 模式？
#        - 或者，文件是否位于 `INCLUDE_SUBDIRS` 指定的 **至少一个** 目录内？
#        - 如果至少满足一个 -> 该文件的 "初始作用域" 被视为 **包含**。进入步骤 4。
#        - 如果两者都不满足 -> 文件被 **排除**。处理结束。
#
# 4. **扩展名过滤 (应用于初始作用域内的文件)**:
#    - 查看 `INCLUDE_EXTENSIONS` 列表是否 **为空**？
#      - 如果 **是** -> 文件被 **包含**。处理结束。
#      - 如果 **否** ->
#        - 文件的扩展名 (或精确文件名) 是否匹配 `INCLUDE_EXTENSIONS` 中的 **至少一个**？
#        - 如果 **是** -> 文件被 **包含**。处理结束。
#        - 如果 **否** -> 文件被 **排除**。处理结束。
#
# Mode 3 (完整结构) 只应用 EXCLUDE_DIRS 来决定遍历哪些目录，不应用其他文件过滤规则。
# Mode 1 和 3 是否实际输出完整结构树，还受 INCLUDE_FULL_STRUCTURE_TREE 控制。

# --- Git忽略文件处理 ---
# 5. 是否处理 .gitignore 文件 (Process .gitignore)
#    如果为 True, 脚本将自动读取项目根目录下的 .gitignore 文件，
#    并将其中的规则追加到 EXCLUDE_DIRS 和 EXCLUDE_FILES 中。
#    注意: 这只实现了 .gitignore 的一部分基本功能 (如文件、目录和通配符后缀)。
#    不支持否定规则 (!) 或复杂的路径匹配。
PROCESS_GITIGNORE: bool = True

# --- 排除规则 (Exclusion Rules - 应用于未被强制排除的文件) ---

# 6. 按目录排除 (Exclude Directories - Priority 2.1)
#    排除这些目录及其所有子目录下的文件和目录。
#    列表项可以是：目录名 或 相对路径 (使用 / 分隔)。
#    这些目录及其内容不会出现在任何结构树中 (Mode 1, 2, 3)。
EXCLUDE_DIRS: List[str] = [
    "__pycache__", ".venv", "venv", ".git", ".idea", "node_modules",
]

# 7. 按文件名或路径排除 (Exclude Files - Priority 2.2)
#    排除匹配这些模式的文件 (影响 Mode 1 和 Mode 2 的文件包含)。
#    列表项可以是：文件名 或 "向上追溯" 的相对路径 (使用 / 分隔)。
#    注意: 脚本自身和原始 OUTPUT_FILENAME 已被硬编码排除。
EXCLUDE_FILES: List[str] = [

]

# 8. 按后缀排除 (Exclude Extensions - Priority 2.3)
#    排除具有指定扩展名的文件 (影响 Mode 1 和 Mode 2)。
#    列表项可以是包含点 '.' 的后缀 (如 ".log") 或精确文件名 (如 "LICENSE")。不区分大小写。
EXCLUDE_EXTENSIONS: List[str] = [
    ".pyc", ".log", ".tmp", ".bak", ".swp", ".swo", ".swn", ".coverage",  # ".txt", # ".md",
]

# --- 包含规则 (Inclusion Rules - 应用于未被排除的文件, 影响 Mode 1 和 Mode 2) ---
# 参考上面的 "筛选规则优先级与逻辑说明"。

# 9. 按文件名或路径包含 (Include Specific Files - 决定初始作用域)
INCLUDE_FILES: List[str] = [

]

# 10. 按子目录包含 (Include Files in Subdirs - 决定初始作用域)
INCLUDE_SUBDIRS: List[str] = [

]

# 11. 按后缀包含 (Include Extensions - 作为最终过滤器)
#      过滤已进入 "初始作用域" 的文件。空列表表示不过滤。
#      列表项包含点 '.' (如 ".py") 或精确文件名 (如 "Dockerfile")，不区分大小写。
INCLUDE_EXTENSIONS: List[str] = [
    ".py", ".yaml", ".yml", ".json", ".toml", ".ini",  # 代码和常见配置
    ".md", ".txt",  # 文档和文本
    "requirements.txt", "Dockerfile", ".dockerignore",  # 项目配置 (文件名视为后缀处理)
    ".sh", ".bat", ".csv", ".conf",  # 脚本
    ".tsx", ".ts", ".example", ".gitignore", ".html", ".css", ".svg",
]

# --- 输出格式化 ---
# 12. 文件分隔符模板 (用于 Mode 1)
#      {filepath} 将被替换为文件的相对路径 (使用 / 作为分隔符)。
FILE_SEPARATOR_TEMPLATE: str = "\n--- File: {filepath} ---\n"

# 13. 添加摘要头 (用于 Mode 1)
#      是否在输出文件/内容的文件结构树之后，添加一个包含根目录和筛选摘要的注释头。
ADD_SUMMARY_HEADER: bool = True

# --- 输出文件头部设置 (用于所有模式) ---

# 14. 头部超长分隔符
#      添加到最终输出内容最顶部的分隔符。
OUTPUT_HEADER_SEPARATOR: str = "=" * 80  # 80个等号

# 15. 头部固定说明文本
#      添加到超长分隔符下方的固定说明文字。
#      {script_execution_directory} 会被替换。
#      {generation_time} 会被替换。
#      {output_mode_description} 会被替换。
#      {output_content_details} 会被替换（根据配置动态生成）。
OUTPUT_HEADER_EXPLANATION: str = """
# ==============================================================================
# Project Code Bundle for LLM Context
# ==============================================================================
#
# This file contains information about a software project, generated by the
# 'bundle_project.py' script to provide context to a Large Language Model (LLM).
#
# Script Execution Directory: {script_execution_directory}
# Output Mode: {output_mode_description}
#
# Content Details:
# {output_content_details}
#
# Please use this content as a reference for understanding the project.
#
# Script Version: 1.3.2
# Generation Time: {generation_time}
# ==============================================================================
"""

# ==============================================================================
# 配置结束 - 下面是脚本逻辑
# ==============================================================================

# --- 类型别名 ---
ConfigDict = Dict[str, Any]
# Structure to represent the file tree (nested dictionaries)
# Value is None for a file, Dict for a directory
FileTree = Dict[str, Union[None, 'FileTree']]


# --- 辅助函数 ---

def normalize_path_pattern(pattern: str) -> str:
    """将路径模式标准化为使用 / 分隔符。"""
    return pattern.replace('\\', '/')


def match_file_pattern(pattern: str, relative_path: Path) -> bool:
    """
    检查文件相对路径是否匹配指定的模式。
    支持纯文件名匹配和“向上追溯”的相对路径后缀匹配。
    """
    pattern_posix = normalize_path_pattern(pattern)
    relative_path_posix = relative_path.as_posix()

    # Handle wildcard for extension matching, e.g., "*.log"
    if pattern_posix.startswith('*.'):
        return relative_path_posix.lower().endswith(pattern_posix[1:].lower())

    if '/' not in pattern_posix:
        # 纯文件名匹配
        return relative_path.name == pattern_posix
    else:
        # "向上追溯"的相对路径后缀匹配
        return (relative_path_posix == pattern_posix or
                relative_path_posix.endswith('/' + pattern_posix))


def is_dir_excluded(relative_dir_path: Path, exclude_dirs_config: List[str]) -> bool:
    """检查目录是否应该被排除 (基于 EXCLUDE_DIRS 配置)。"""
    # Convert to parts for component-wise checking and posix for path prefix checking
    dir_parts = set(relative_dir_path.parts)
    dir_path_posix = relative_dir_path.as_posix()
    # '.' represents the root, which should not be excluded by name match
    if dir_path_posix == '.': dir_path_posix = ''

    for pattern in exclude_dirs_config:
        pattern_norm = normalize_path_pattern(pattern).strip('/')  # Remove leading/trailing slashes for consistency
        if not pattern_norm: continue  # Skip empty patterns

        if '/' not in pattern_norm:
            # Match any directory name part
            if pattern_norm in dir_parts:
                return True
        else:
            # Match relative path prefix
            # Check for exact match or if the path starts with pattern/
            if dir_path_posix == pattern_norm or dir_path_posix.startswith(pattern_norm + '/'):
                return True
    return False


def is_file_excluded(relative_path: Path, config: ConfigDict, script_name: str) -> bool:
    """
    检查文件是否匹配任何排除规则 (硬编码 + 配置)。
    仅用于 Mode 1 和 Mode 2 的文件内容和过滤结构。
    """
    # --- 强制硬编码排除 (最高优先级) ---
    # 排除脚本自身和潜在的原始输出文件 (防止读取自身或意外覆盖)
    original_output_filename = config.get('orig_output_filename')
    if relative_path.name == script_name or \
            (original_output_filename and relative_path.name == original_output_filename):
        # print(f"DEBUG: Hardcoded exclusion for {relative_path.as_posix()}") # 可选的调试输出
        return True

    # --- 配置排除检查 (次高优先级) ---
    # 检查目录排除 (虽然 os.walk 会跳过，这里再检查一次以防万一或逻辑变更)
    # Note: is_dir_excluded now only checks EXCLUDE_DIRS config.
    if is_dir_excluded(relative_path.parent, config['exclude_dirs']):
        # print(f"DEBUG: Directory exclusion for {relative_path.as_posix()} based on parent {relative_path.parent}") # 可选调试
        return True

    # 检查文件模式排除 (来自 EXCLUDE_FILES)
    for pattern in config['exclude_files']:
        if match_file_pattern(pattern, relative_path):
            # print(f"DEBUG: File pattern exclusion for {relative_path.as_posix()} matching '{pattern}'") # 可选调试
            return True

    # 检查扩展名排除 (来自 EXCLUDE_EXTENSIONS)
    # MODIFICATION: Simplified logic to handle dotfiles correctly.
    filename_lower = relative_path.name.lower()
    file_ext_lower = relative_path.suffix.lower()

    # 1. 检查精确文件名匹配 (例如 "LICENSE" 或 ".gitignore")
    if filename_lower in config['exclude_extensions']:
        return True

    # 2. 检查后缀匹配 (例如 ".log", ".tmp")
    if file_ext_lower and file_ext_lower in config['exclude_extensions']:
        return True

    # 如果以上所有排除规则都不匹配，则文件不被排除
    return False


def passes_inclusion_rules(relative_path: Path, config: ConfigDict) -> bool:
    """
    检查未被排除的文件是否满足包含规则 (新逻辑)。
    仅用于 Mode 1 和 Mode 2。
    """
    # --- 阶段 1: 确定文件是否在初始作用域内 ---
    file_matches_files_list = False
    if config['include_files']:
        for pattern in config['include_files']:
            if match_file_pattern(pattern, relative_path):
                file_matches_files_list = True
                break

    file_matches_subdirs_list = False
    if config['include_subdirs']:
        relative_dir_posix = relative_path.parent.as_posix()
        # Handle root directory case where parent is '.' -> map to ''
        if relative_dir_posix == '.': relative_dir_posix = ''

        for subdir_pattern in config['include_subdirs_posix']:
            # Exact match for the directory itself
            if relative_dir_posix == subdir_pattern:
                file_matches_subdirs_list = True
                break
            # Starts with the pattern + '/' (matches subdirectories)
            # Ensure subdir_pattern is not empty to avoid matching everything on startswith('/')
            if subdir_pattern and relative_dir_posix.startswith(subdir_pattern + '/'):
                file_matches_subdirs_list = True
                break
            # Special case: If subdir_pattern is "" (meaning root), match files directly in root
            if not subdir_pattern and '/' not in relative_dir_posix:
                file_matches_subdirs_list = True
                break

    in_initial_scope = False
    files_or_subdirs_defined = bool(config['include_files']) or bool(config['include_subdirs'])

    if not files_or_subdirs_defined:
        # 如果 INCLUDE_FILES 和 INCLUDE_SUBDIRS 都为空，则所有未被排除的文件都在初始作用域内
        in_initial_scope = True
    else:
        # 否则，需要匹配 FILES 或 SUBDIRS 列表之一
        if file_matches_files_list or file_matches_subdirs_list:
            in_initial_scope = True

    if not in_initial_scope:
        return False  # 不在初始作用域内，直接排除

    # --- 阶段 2: 对在初始作用域内的文件应用扩展名过滤 ---
    if not config['include_extensions']:
        # 如果 INCLUDE_EXTENSIONS 为空，则不进行扩展名过滤，直接包含
        return True
    else:
        # 如果指定了 INCLUDE_EXTENSIONS，则需要匹配
        # MODIFICATION: Simplified logic to handle dotfiles correctly.
        filename_lower = relative_path.name.lower()
        file_ext_lower = relative_path.suffix.lower()

        # 1. 优先检查精确文件名匹配 (例如 "Dockerfile" 或 ".gitignore")
        if filename_lower in config['include_extensions']:
            return True

        # 2. 然后检查后缀匹配 (例如 ".py", ".md")
        if file_ext_lower and file_ext_lower in config['include_extensions']:
            return True

        return False


# --- 文件树构建与格式化 (通用部分) ---

def _build_tree_recursive(tree: FileTree, parts: Tuple[str, ...], is_file: bool):
    """Helper recursive function to build a file tree."""
    part = parts[0]
    remaining_parts = parts[1:]

    if not remaining_parts:  # Last part
        if is_file:
            if part in tree and isinstance(tree[part], dict):
                print(f"Warning: Tree building conflict - trying to add file '{part}' where directory exists.",
                      file=sys.stderr)
            else:
                tree[part] = None  # Mark as file
        else:  # It's a directory ending here
            if part not in tree:
                tree[part] = {}  # Ensure directory node exists
            # If it already exists as a file, print warning but keep the dir? Or prioritize file? Let's prioritize dir.
            elif tree[part] is None:
                print(f"Warning: Tree building conflict - replacing file '{part}' with directory.", file=sys.stderr)
                tree[part] = {}
    else:  # Directory path continues
        if part not in tree or tree[part] is None:
            # If it doesn't exist or exists as a file, create/overwrite with a directory
            if part in tree and tree[part] is None:
                print(
                    f"Warning: Tree building conflict - replacing file '{part}' with directory during path traversal.",
                    file=sys.stderr)
            tree[part] = {}
        # Type assertion needed because we ensured it's a dict
        current_level = tree[part]
        assert isinstance(current_level, dict), f"Expected dict, got {type(current_level)} for '{part}'"
        _build_tree_recursive(current_level, remaining_parts, is_file)


def build_tree_from_paths(paths: List[Path], root_dir: Path) -> FileTree:
    """根据文件和目录路径列表构建嵌套字典表示的文件树。"""
    tree: FileTree = {}
    processed_dirs: Set[Path] = set()

    # Sort paths to ensure parent directories are processed before children, generally
    # This helps in correctly creating nested structures.
    sorted_paths = sorted(paths, key=lambda p: p.parts)

    for relative_path in sorted_paths:
        if not relative_path.parts: continue  # Skip empty path (e.g., Path('.'))

        full_path = root_dir / relative_path
        is_file_flag = False  # Default to dir unless known to be file
        if full_path.exists():  # Check disk only if necessary
            is_file_flag = full_path.is_file()
        elif relative_path.suffix:  # Heuristic: if it has a suffix, assume it was a file
            is_file_flag = True

        # Add parent directories implicitly if not already added
        parent = relative_path.parent
        while parent != Path('.') and parent not in processed_dirs:
            if parent.parts:  # Avoid adding '.' itself via this loop
                _build_tree_recursive(tree, parent.parts, is_file=False)
            processed_dirs.add(parent)
            parent = parent.parent
        if parent == Path('.') and parent not in processed_dirs:  # Process root's direct children's parent
            processed_dirs.add(parent)  # Mark root as processed

        _build_tree_recursive(tree, relative_path.parts, is_file=is_file_flag)

    return tree


def format_tree_node(name: str, node: Optional[FileTree], prefix: str, is_last: bool) -> List[str]:
    """递归地格式化树的一个节点（文件或目录）。"""
    lines: List[str] = []
    connector = "└── " if is_last else "├── "
    # Append / to directory names for clarity in the tree view
    node_display = name + "/" if isinstance(node, dict) else name
    lines.append(f"{prefix}{connector}{node_display}")

    if isinstance(node, dict):  # It's a directory, recurse
        new_prefix = prefix + ("    " if is_last else "│   ")  # Use spaces for alignment
        # Sort items: directories first (case-insensitive), then files (case-insensitive)
        sorted_items = sorted(
            node.items(),
            key=lambda item: (not isinstance(item[1], dict), item[0].lower())
        )
        for i, (sub_name, sub_node) in enumerate(sorted_items):
            is_last_item = (i == len(sorted_items) - 1)
            lines.extend(format_tree_node(sub_name, sub_node, new_prefix, is_last_item))
    return lines


def generate_tree_string(title: str, tree: FileTree, root_display: str = ".") -> str:
    """生成文件树的完整字符串表示，带有自定义标题和根显示。"""
    lines = [f"# {title}:"]
    lines.append(f"# {root_display}" + ("/" if tree else ""))  # Add root indicator
    # Sort top-level items: directories first, then files
    sorted_top_level = sorted(
        tree.items(),
        key=lambda item: (not isinstance(item[1], dict), item[0].lower())
    )
    for i, (name, node) in enumerate(sorted_top_level):
        is_last_item = (i == len(sorted_top_level) - 1)
        lines.extend(format_tree_node(name, node, "", is_last_item))
    lines.append("# " + "=" * 60)  # Separator after tree
    return "\n".join(lines) + "\n"


# --- 摘要头函数 (Used only in Mode 1) ---

def create_summary_header(root_dir: Path, config: ConfigDict) -> str:
    """生成输出内容的摘要头 (放在文件树之后)。"""
    header_lines = [
        "# Bundle Configuration Summary:",
        f"# Root Directory: {root_dir.as_posix()}",
        "# Applied Filters (Exclusions first, then Inclusion Scope + Extension Filter):",
        f"# - Hardcoded Exclusions: ['{Path(__file__).name}', '{config.get('orig_output_filename', 'N/A')}']"
        # Show dynamic hardcoded names
    ]
    # Config Exclusions
    if config['orig_exclude_dirs']: header_lines.append(
        f"# - Config Excluded Dirs (incl. .gitignore): {config['orig_exclude_dirs']}")
    if config['orig_exclude_files']: header_lines.append(
        f"# - Config Excluded Files (incl. .gitignore): {config['orig_exclude_files']}")
    if config['orig_exclude_extensions']: header_lines.append(
        f"# - Config Excluded Extensions: {config['orig_exclude_extensions']}")

    # Inclusion Scope
    files_or_subdirs_defined = bool(config['orig_include_files']) or bool(config['orig_include_subdirs'])
    if not files_or_subdirs_defined:
        header_lines.append("# - Inclusion Scope: All files not excluded by above rules.")
    else:
        scope_details = []
        if config['orig_include_files']: scope_details.append(f"files matching {config['orig_include_files']}")
        if config['orig_include_subdirs']: scope_details.append(f"files in dirs {config['orig_include_subdirs']}")
        header_lines.append(f"# - Inclusion Scope: {' OR '.join(scope_details)}")

    # Extension Filter
    if not config['orig_include_extensions']:
        header_lines.append("# - Extension Filter: None (all types included from scope)")
    else:
        header_lines.append(f"# - Extension Filter: Files must match {config['orig_include_extensions']}")

    # Add note about full tree if it was potentially included
    if config.get('include_full_structure_tree', True) and config.get('output_mode', 1) in [1, 3]:
        header_lines.append("# Note: The full project structure (respecting Excluded Dirs) was listed earlier.")
    elif not config.get('include_full_structure_tree', False) and config.get('output_mode', 1) in [1, 3]:
        header_lines.append(
            "# Note: The full project structure was disabled by the INCLUDE_FULL_STRUCTURE_TREE setting.")

    header_lines.append("# " + "=" * 60)
    return "\n".join(header_lines) + "\n"


# --- 主逻辑 ---

def main():
    """主执行函数。"""
    # 0. Get script name and directory for hardcoded exclusion and header info
    script_path = Path(__file__).resolve()
    script_name = script_path.name
    script_dir = script_path.parent

    # 1. 解析和验证根目录
    if not ROOT_DIR:
        root_dir_path = script_dir
    else:
        root_dir_path = Path(ROOT_DIR).resolve()

    if not root_dir_path.is_dir():
        print(f"Error: Root directory not found or is not a directory: {root_dir_path}", file=sys.stderr)
        sys.exit(1)

    print(f"Scanning project in: {root_dir_path}")
    print(f"Script running from: {script_dir}")  # Inform user

    # <<<< MODIFICATION START: .gitignore processing >>>>
    # 1.A. (可选) 读取并处理 .gitignore 文件
    # 为了避免直接修改原始配置列表，我们创建副本
    effective_exclude_dirs = EXCLUDE_DIRS[:]
    effective_exclude_files = EXCLUDE_FILES[:]

    # 使用 globals().get() 安全地检查 PROCESS_GITIGNORE 是否存在并为 True
    if globals().get('PROCESS_GITIGNORE'):
        gitignore_path = root_dir_path / ".gitignore"
        if gitignore_path.is_file():
            print(f"Found and processing: {gitignore_path}")
            try:
                with open(gitignore_path, 'r', encoding='utf-8') as f:
                    for line in f:
                        line = line.strip()
                        if not line or line.startswith('#'):
                            continue

                        # 简化 .gitignore 规则处理：
                        # - 如果以 / 结尾, 视为目录排除
                        # - 否则, 视为文件/目录模式，同时加入到两个排除列表以确保覆盖
                        if line.endswith('/'):
                            pattern = line.strip('/')
                            if pattern and pattern not in effective_exclude_dirs:
                                effective_exclude_dirs.append(pattern)
                        else:
                            # 对于像 `__pycache__` 或 `*.log` 这样的模式,
                            # 添加到文件排除列表。脚本的 match_file_pattern 支持 `*.ext` 形式。
                            pattern = line.lstrip('/')  # 移除开头的斜杠
                            if pattern not in effective_exclude_files:
                                effective_exclude_files.append(pattern)
                            # 如果模式不含通配符，也可能是个目录名
                            if '*' not in pattern and '?' not in pattern and not Path(pattern).suffix:
                                if pattern not in effective_exclude_dirs:
                                    effective_exclude_dirs.append(pattern)
            except Exception as e:
                print(f"Warning: Could not read or process .gitignore file: {e}", file=sys.stderr)
        else:
            print("Info: PROCESS_GITIGNORE is True, but no .gitignore file was found at the root.")
    # <<<< MODIFICATION END >>>>

    # 1.5 Validate OUTPUT_MODE
    valid_modes = [1, 2, 3]
    current_output_mode = OUTPUT_MODE
    if current_output_mode not in valid_modes:
        print(
            f"Warning: Invalid OUTPUT_MODE ({current_output_mode}) specified. Must be 1, 2, or 3. Defaulting to 1 (Full Bundle).",
            file=sys.stderr)
        current_output_mode = 1

    # 2. 准备配置字典 (进行标准化和预处理)
    # !! 使用上面处理过的 effective_exclude_* 列表 !!
    config: ConfigDict = {
        # Processed/normalized versions for internal use
        'exclude_dirs': [normalize_path_pattern(p).strip('/') for p in effective_exclude_dirs if p],
        'exclude_files': [normalize_path_pattern(p) for p in effective_exclude_files if p],
        'exclude_extensions': [e.lower() for e in EXCLUDE_EXTENSIONS if e],
        'include_files': [normalize_path_pattern(p) for p in INCLUDE_FILES if p],
        'include_subdirs': [normalize_path_pattern(p).strip('/') for p in INCLUDE_SUBDIRS if p],
        'include_extensions': [e.lower() for e in INCLUDE_EXTENSIONS if e],
        'separator': FILE_SEPARATOR_TEMPLATE,
        'add_summary': ADD_SUMMARY_HEADER if current_output_mode == 1 else False,  # Only add summary in Mode 1
        'output_mode': current_output_mode,  # Store validated mode
        'include_full_structure_tree': INCLUDE_FULL_STRUCTURE_TREE,
        'output_header_separator': OUTPUT_HEADER_SEPARATOR,
        'output_header_explanation': OUTPUT_HEADER_EXPLANATION.strip(),
        # Keep original lists for the summary header for better readability
        # !! 使用 effective 列表，以便摘要头能反映 .gitignore 的内容 !!
        'orig_exclude_dirs': effective_exclude_dirs,
        'orig_exclude_files': effective_exclude_files,
        'orig_exclude_extensions': EXCLUDE_EXTENSIONS,
        'orig_include_files': INCLUDE_FILES,
        'orig_include_subdirs': INCLUDE_SUBDIRS,
        'orig_include_extensions': INCLUDE_EXTENSIONS,
        # Keep original output filename for exclusion checks
        'orig_output_filename': OUTPUT_FILENAME,
    }
    # MODIFICATION: Removed the pre-processing of extensions, as the logic
    # now handles dotfiles and extensions directly in the filter functions.

    # Normalize include_subdirs to posix paths for comparison
    config['include_subdirs_posix'] = [p for p in config['include_subdirs']]

    # 3. 遍历、收集所有路径、筛选文件
    files_to_bundle: List[Path] = []  # Only relevant for modes 1 and 2
    all_scanned_paths: List[Path] = []  # Relative paths of ALL files/dirs encountered after dir exclusion
    print("Scanning files and directories...")

    # Using os.walk for efficient directory exclusion
    for dirpath_str, dirnames, filenames in os.walk(root_dir_path, topdown=True, onerror=lambda e: print(
            f"Warning: Cannot access path {e.filename}: {e}", file=sys.stderr)):
        dirpath = Path(dirpath_str)
        relative_dir_path = dirpath.relative_to(root_dir_path)

        # --- Directory Exclusion during Walk (Based ONLY on EXCLUDE_DIRS config) ---
        original_dirnames = dirnames[:]  # Iterate over a copy
        dirnames.clear()  # Modify the list os.walk uses
        kept_dirnames = []
        for dname in original_dirnames:
            d_relative_path = relative_dir_path / dname
            # Use the specific helper that only checks EXCLUDE_DIRS
            if not is_dir_excluded(d_relative_path, config['exclude_dirs']):
                dirnames.append(dname)  # Allow walk to descend
                kept_dirnames.append(dname)  # Keep track for adding to all_scanned_paths
            # else:
            # print(f"DEBUG: Pruning walk at directory: {d_relative_path.as_posix()}") # 可选调试

        # --- Add kept directories and current directory (if not root) to full list ---
        if relative_dir_path != Path('.'):  # Add the current directory itself unless it's the root
            all_scanned_paths.append(relative_dir_path)
        for dname in kept_dirnames:  # Add subdirectories that were not pruned
            all_scanned_paths.append(relative_dir_path / dname)

        # --- File Processing ---
        for filename in filenames:
            file_path = dirpath / filename
            relative_path = file_path.relative_to(root_dir_path)

            # Add ALL encountered files (relative path) to the full scanned list (for Mode 3 tree)
            all_scanned_paths.append(relative_path)

            # Apply filtering logic ONLY if needed (Mode 1 or 2)
            if config['output_mode'] in [1, 2]:
                # Pass script_name and original output filename to is_file_excluded
                if not is_file_excluded(relative_path, config, script_name):  # Checks hardcoded AND config exclusions
                    if passes_inclusion_rules(relative_path, config):  # Checks include logic
                        files_to_bundle.append(relative_path)
                    # else: # Optional debug for files excluded by inclusion rules
                    # print(f"DEBUG: File excluded by inclusion rules: {relative_path.as_posix()}")
                # else: # Optional debug for files excluded by exclusion rules (hardcoded or config)
                # print(f"DEBUG: File excluded by is_file_excluded: {relative_path.as_posix()}")

    # 4. 排序文件列表 (for consistent output)
    files_to_bundle.sort()
    # Sort all paths as well for the full tree display consistency
    # No need to sort all_scanned_paths here, build_tree_from_paths does internal sorting

    print(f"Total items scanned (files/dirs after directory exclusion): {len(all_scanned_paths)}")
    if config['output_mode'] in [1, 2]:
        print(f"Found {len(files_to_bundle)} files matching the inclusion criteria (for Mode {config['output_mode']}).")

    # 5. 生成输出内容 based on OUTPUT_MODE
    output_buffer = io.StringIO()
    generation_time_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S %Z")

    # --- Generate Header ---
    mode_description = "Unknown"
    content_details_lines = []
    include_full_tree_flag = config.get('include_full_structure_tree', True)  # Get flag value

    # Determine content details based on mode and flags
    if config['output_mode'] == 1:
        mode_description = "1 (Full Bundle)"
        if include_full_tree_flag:
            content_details_lines.append("- Complete scanned project structure (respecting directory exclusions).")
        else:
            content_details_lines.append("- Complete scanned project structure: [DISABLED BY CONFIG]")
        content_details_lines.append("- Filtered file structure (showing included files).")
        if config['add_summary']:
            content_details_lines.append("- Summary of filtering rules.")
        content_details_lines.append("- Concatenated content of included files.")
    elif config['output_mode'] == 2:
        mode_description = "2 (Filtered Structure Only)"
        content_details_lines.append("- Filtered file structure (showing files that meet inclusion/exclusion rules).")
    elif config['output_mode'] == 3:
        mode_description = "3 (Full Structure Only)"
        if include_full_tree_flag:
            content_details_lines.append("- Complete scanned project structure (respecting directory exclusions).")
        else:
            content_details_lines.append("- Complete scanned project structure: [DISABLED BY CONFIG]")

    content_details = "\n#    ".join(content_details_lines)  # Format for multi-line display in header

    if config.get('output_header_separator'):
        output_buffer.write(config['output_header_separator'] + "\n")
    if config.get('output_header_explanation'):
        header_text = config['output_header_explanation'].format(
            script_execution_directory=script_dir.as_posix(),  # Pass script dir path
            generation_time=generation_time_str,
            output_mode_description=mode_description,
            output_content_details=content_details  # Use updated details
        )
        output_buffer.write(header_text + "\n\n")

    # --- Generate Content Sections based on Mode ---

    # -- Section: Full Project Structure (Modes 1 and 3, if enabled by config) --
    if config['output_mode'] in [1, 3] and config['include_full_structure_tree']:
        print("Generating full project structure tree...")
        if not all_scanned_paths:
            output_buffer.write(
                "# Full Project Structure (Scan Results):\n# (No files or directories found/kept after directory exclusion)\n")
            output_buffer.write("# " + "=" * 60 + "\n\n")
        else:
            full_project_tree = build_tree_from_paths(all_scanned_paths, root_dir_path)
            full_tree_string = generate_tree_string(
                "Full Project Structure (Scan Results - Respects EXCLUDE_DIRS)",
                full_project_tree,
                root_display=root_dir_path.name  # Display root dir name instead of just '.'
            )
            output_buffer.write(full_tree_string)
            output_buffer.write("\n")  # Add extra newline for separation
    elif config['output_mode'] in [1, 3] and not config['include_full_structure_tree']:
        output_buffer.write(
            "# Full Project Structure: Skipped based on configuration (INCLUDE_FULL_STRUCTURE_TREE = False).\n")
        output_buffer.write("# " + "=" * 60 + "\n\n")

    # -- Section: Filtered File Structure (Modes 1 and 2) --
    if config['output_mode'] in [1, 2]:
        print("Generating included file structure tree...")
        if not files_to_bundle:
            print("No files matched the criteria for inclusion.")
            output_buffer.write(
                "# Included File Structure (After Filtering):\n# (No files matched inclusion criteria)\n")
            output_buffer.write("# " + "=" * 60 + "\n")
        else:
            included_file_tree_dict = build_tree_from_paths(files_to_bundle, root_dir_path)
            included_tree_string = generate_tree_string(
                "Included File Structure (After Filtering)",
                included_file_tree_dict,
                root_display=root_dir_path.name
            )
            output_buffer.write(included_tree_string)
            output_buffer.write("\n")  # Add extra newline for separation

    # -- Section: Summary Header (Mode 1 only) --
    if config['output_mode'] == 1 and config['add_summary']:
        output_buffer.write(create_summary_header(root_dir_path, config))
        output_buffer.write("\n")

    # -- Section: File Content (Mode 1 only) --
    if config['output_mode'] == 1:
        if files_to_bundle:
            print("Adding file contents...")
            for relative_path in files_to_bundle:
                file_path = root_dir_path / relative_path
                separator = config['separator'].format(filepath=relative_path.as_posix())
                output_buffer.write(separator)

                try:
                    # First try UTF-8, the most common encoding
                    with open(file_path, 'r', encoding='utf-8') as infile:
                        output_buffer.write(infile.read())
                except UnicodeDecodeError:
                    # If UTF-8 fails, try with replacement characters as a fallback
                    print(f"Warning: Could not decode file as UTF-8: {file_path}. Trying with replacement.",
                          file=sys.stderr)
                    try:
                        with open(file_path, 'r', encoding='utf-8', errors='replace') as infile:
                            output_buffer.write(infile.read())
                        output_buffer.write("\n[Warning: File contained non-UTF-8 characters replaced during read]\n")
                    except Exception as e_inner:
                        # If even replacement fails, log error and skip content
                        print(f"Error: Failed to read file {file_path} even with replacement: {e_inner}",
                              file=sys.stderr)
                        output_buffer.write(
                            f"[Error: Could not read file {relative_path.as_posix()} after decode error: {e_inner}]\n")
                except FileNotFoundError:
                    print(f"Warning: File not found during read (was listed but now missing?): {file_path}",
                          file=sys.stderr)
                    output_buffer.write(f"[Error: File not found at read time: {relative_path.as_posix()}]\n")
                except OSError as e:
                    print(f"Error: Could not read file {file_path}: {e}", file=sys.stderr)
                    output_buffer.write(f"[Error: Could not read file {relative_path.as_posix()}: {e}]\n")
                except Exception as e_generic:
                    print(f"Error: Unexpected error reading file {file_path}: {e_generic}", file=sys.stderr)
                    output_buffer.write(
                        f"[Error: Unexpected error reading file {relative_path.as_posix()}: {e_generic}]\n")

                # Ensure a newline after each file content
                output_buffer.seek(0, io.SEEK_END)
                if output_buffer.tell() > 0:
                    output_buffer.seek(output_buffer.tell() - 1)
                    last_char = output_buffer.read(1)
                    if last_char != '\n':
                        output_buffer.seek(0, io.SEEK_END)
                        output_buffer.write('\n')
                    else:
                        output_buffer.seek(0, io.SEEK_END)

        else:
            # No files included, add a note
            output_buffer.write("\n# --- No files included in the bundle based on filters. ---\n")

    output_content = output_buffer.getvalue()

    # 6. Determine Output Destination (File or Console) and Filename
    output_destination_config = config.get('orig_output_filename')  # Use original config value
    final_output_path = None  # Will be Path object if writing to file

    if output_destination_config:  # User wants to write to a file
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        base_name, ext = os.path.splitext(output_destination_config)

        if not base_name and ext:
            base_name = "project_bundle"
        elif not base_name and not ext:
            base_name = "project_bundle"

        if not ext:
            ext = ".txt"

        output_mode = config['output_mode']

        # Construct filename based on mode
        if output_mode == 1:
            filename = f"{base_name}_{timestamp}{ext}"
        elif output_mode == 2:
            filename = f"{base_name}_filtered_structure_{timestamp}{ext}"
        elif output_mode == 3:
            filename = f"{base_name}_full_structure_{timestamp}{ext}"

        final_output_path = script_dir / filename

        # --- Safety Check ---
        if final_output_path.name == script_name:
            print(
                f"Error: Calculated output file name '{final_output_path.name}' conflicts with script name. Adjust OUTPUT_FILENAME config.",
                file=sys.stderr)
            sys.exit(1)

    # --- Write Output ---
    if final_output_path:
        try:
            with open(final_output_path, 'w', encoding='utf-8') as outfile:
                outfile.write(output_content)
            print(f"Output successfully written to: {final_output_path}")
        except OSError as e:
            print(f"Error: Could not write to output file {final_output_path}: {e}", file=sys.stderr)
            print("\n--- Output Content (due to write error) ---")
            print(output_content)
            print("--- End Output Content ---")
        except Exception as e_generic_write:
            print(f"Error: Unexpected error writing to output file {final_output_path}: {e_generic_write}",
                  file=sys.stderr)
    else:  # Output to console
        print("\n--- Combined Output (stdout) ---")
        if output_content and not output_content.endswith('\n'):
            output_content += '\n'
        try:
            sys.stdout.write(output_content)
            sys.stdout.flush()
        except Exception as e_stdout:
            print(f"Error writing to stdout: {e_stdout}", file=sys.stderr)
        print("--- End Output ---")


if __name__ == "__main__":
    main()