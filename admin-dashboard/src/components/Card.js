function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 transition-colors ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
}

export default Card;
