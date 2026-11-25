import { Link } from 'react-router-dom';

export default function Button({ to, href, children, variant = 'gold', className = '', ...props }) {
  const classNames = `button button--${variant} ${className}`.trim();
  if (to) return <Link className={classNames} to={to} {...props}>{children}</Link>;
  if (href) return <a className={classNames} href={href} {...props}>{children}</a>;
  return <button className={classNames} {...props}>{children}</button>;
}
