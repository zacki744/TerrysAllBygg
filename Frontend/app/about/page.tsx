import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "../pages.module.css";

export default function About() {
  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.mainNarrow}>
        <h1 className={styles.aboutTitle}>Om oss</h1>
        <p className={styles.aboutBody}>
          Vi är ett byggföretag med fokus på kvalitetshantverk och långvariga
          byggnadslösningar.
        </p>
      </main>

      <Footer />
    </div>
  );
}