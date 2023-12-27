import style from "./NoTFoundPage.module.css";

const NoPage = () => {
  return (
    <section className={style.not_found}>
      <div>
        <h2>Sorry, this page is not available.</h2>
        <p>
          The link you followed may be broken,
          or the page may have been removed.
        </p>
      </div>
    </section>
  )
}

export default NoPage
