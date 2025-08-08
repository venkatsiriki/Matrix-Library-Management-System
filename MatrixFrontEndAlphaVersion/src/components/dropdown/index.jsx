import React from "react";

function useOutsideAlerter(ref, setX) {
  React.useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setX(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, setX]);
}

const Dropdown = (props) => {
  const { button, children, classNames, animation } = props;
  const wrapperRef = React.useRef(null);
  const [openWrapper, setOpenWrapper] = React.useState(false);
  useOutsideAlerter(wrapperRef, setOpenWrapper);

  return (
    <div ref={wrapperRef} className="relative flex">
      <div className="flex" onMouseDown={() => setOpenWrapper(!openWrapper)}>
        {button}
      </div>
      {openWrapper && (
      <div
          className={`absolute z-10 w-max rounded-xl bg-white py-3 px-4 text-sm shadow-dropdown dark:bg-navy-700 dark:shadow-dropdown-dark ${classNames}`}
          onMouseLeave={() => setOpenWrapper(false)}
      >
        {children}
      </div>
      )}
    </div>
  );
};

export default Dropdown;
