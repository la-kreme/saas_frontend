interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, subtitle, right }: PageHeaderProps) {
  return (
    <div className="lk-page-header">
      <div>
        {eyebrow && (
          <div className="lk-page-header__eyebrow">
            {eyebrow}
          </div>
        )}
        <h1 className="lk-page-header__title">
          {title}
        </h1>
        {subtitle && (
          <p className="lk-page-header__subtitle">
            {subtitle}
          </p>
        )}
      </div>
      {right && <div className="lk-page-header__right">{right}</div>}
    </div>
  );
}
