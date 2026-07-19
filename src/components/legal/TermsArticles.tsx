import { TERMS_ARTICLES } from "./legalContent";

export function TermsArticles() {
  return (
    <div className="space-y-5 text-sm leading-relaxed text-gray-700">
      {TERMS_ARTICLES.map((article) => (
        <section key={article.title}>
          <h3 className="mb-1.5 font-semibold text-gray-900">{article.title}</h3>
          {article.body && <p>{article.body}</p>}
          {article.intro && <p className="mb-1.5">{article.intro}</p>}
          {article.items && (
            <ul className="space-y-1">
              {article.items.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
