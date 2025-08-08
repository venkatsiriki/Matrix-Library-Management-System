function Card(props) {
  const { variant, extra, children, ...rest } = props;
  return (
    <div
      className={`!z-5 relative flex flex-col rounded-[20px] bg-white bg-clip-border shadow-card-light hover:shadow-card-hover transition-shadow duration-200 dark:bg-navy-800 dark:text-white dark:shadow-card-dark ${extra}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Card;
