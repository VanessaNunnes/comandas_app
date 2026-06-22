const showConfirm = (title, message, onConfirm) => {
  window.dispatchEvent(
    new CustomEvent('showConfirm', {
      detail: { title, message, onConfirm },
    })
  );
};

export default showConfirm;
