import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found-container">
        <h1>404 - Page Not Found</h1>
        <p>The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link to="/" className="btn btn-primary">
          Go Back Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
