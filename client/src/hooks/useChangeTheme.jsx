const useChangeTheme = () => {
  const changeTheme = async () => {
    const currentTheme = localStorage.getItem("theme");
    const rootStyles = document.documentElement.style;

    if (currentTheme === "light") {
      localStorage.setItem("theme", "dark");
      rootStyles.setProperty('--white', '#000');
      rootStyles.setProperty('--dark', '#fff');
    } else {
      localStorage.setItem("theme", "light");
      rootStyles.setProperty('--white', '#fff');
      rootStyles.setProperty('--dark', '#000');
    }
  }

  return changeTheme;
}

export default useChangeTheme
