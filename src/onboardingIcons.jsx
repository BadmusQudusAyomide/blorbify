const IconBase = ({ children, size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {children}
  </svg>
);

export function IconBriefcase(props) {
  return (
    <IconBase {...props}>
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 11.5h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </IconBase>
  );
}

export function IconPalette(props) {
  return (
    <IconBase {...props}>
      <path d="M12 3.5c-4.7 0-8.5 3.8-8.5 8.5 0 2.4 1 4.5 2.6 6.1.6.6 1.1 1.1 1.4 1.7.3.6.5 1.5.5 2.5 0 .5.4.9.9.9h7.7c.5 0 .9-.4.9-.9 0-1 .2-1.8.5-2.5.3-.6.8-1.1 1.4-1.7A8.51 8.51 0 0 0 12 3.5Z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="9" cy="9.5" r="1" fill="currentColor" />
      <circle cx="15" cy="8.5" r="1" fill="currentColor" />
      <circle cx="10.5" cy="14" r="1" fill="currentColor" />
    </IconBase>
  );
}

export function IconBox(props) {
  return (
    <IconBase {...props}>
      <path d="M4.5 7.2 12 3l7.5 4.2v9.6L12 21l-7.5-4.2V7.2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="m4.5 7.2 7.5 4.2 7.5-4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 11.4v9.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </IconBase>
  );
}

export function IconRocket(props) {
  return (
    <IconBase {...props}>
      <path d="M14 4.5c4.4 1 7.5 4.1 8.5 8.5-4.4 1-7.5 4.1-8.5 8.5-1-4.4-4.1-7.5-8.5-8.5 4.4-1 7.5-4.1 8.5-8.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 8.5c-1.8 1.7-3 4.1-3.5 6.5 2.4.5 4.8 1.7 6.5 3.5.4-2.7 1.1-5.2 2.5-7.3-2.1-1.4-4.6-2.1-7.3-2.7Z" fill="currentColor" fillOpacity="0.18" />
      <path d="M8.7 15.3c1.3 1.3 2.8 2.2 4.5 2.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </IconBase>
  );
}

export function IconArrowRight(props) {
  return (
    <IconBase {...props}>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="m13 6 6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

export function IconArrowLeft(props) {
  return (
    <IconBase {...props}>
      <path d="M19 12H5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="m11 6-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

export function IconPlus(props) {
  return (
    <IconBase {...props}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </IconBase>
  );
}

export function IconTrash(props) {
  return (
    <IconBase {...props}>
      <path d="M4.5 7h15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.5 10v7M15.5 10v7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6 7l1 12a1.5 1.5 0 0 0 1.5 1.3h7a1.5 1.5 0 0 0 1.5-1.3l1-12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </IconBase>
  );
}

export function IconSparkles(props) {
  return (
    <IconBase {...props}>
      <path d="m12 3 1.3 4.7L18 9l-4.7 1.3L12 15l-1.3-4.7L6 9l4.7-1.3L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="m18 15 0.6 2.4L21 18l-2.4 0.6L18 21l-0.6-2.4L15 18l2.4-0.6L18 15Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </IconBase>
  );
}

export function IconStore(props) {
  return (
    <IconBase {...props}>
      <path d="M3.5 8 12 3l8.5 5v11A1.5 1.5 0 0 1 19 20.5H5A1.5 1.5 0 0 1 3.5 19V8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 20.5V12h6v8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </IconBase>
  );
}

export function IconCheck(props) {
  return (
    <IconBase {...props}>
      <path d="M5 12.5 9.5 17 19 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}
