// CSS Module type declarations
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// Additional module declarations
declare module '*.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// SVG modules
declare module '*.svg' {
  const content: string;
  export default content;
}

// Image modules
declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}