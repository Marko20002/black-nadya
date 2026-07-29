import './Loader.css';

export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="loader">
      <div className="loader__spinner" />
      <p>{label}</p>
    </div>
  );
}
