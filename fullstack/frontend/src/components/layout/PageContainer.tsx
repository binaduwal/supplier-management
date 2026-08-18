import type { ReactNode } from "react";

interface PageContainerProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function PageContainer({
  title,
  description,
  actions,
  children,
}: PageContainerProps) {
  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1>{title}</h1>
          {description ? <p className="page__description">{description}</p> : null}
        </div>
        {actions ? <div className="page__actions">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}
