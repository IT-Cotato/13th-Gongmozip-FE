import { PRIVACY_INTRO, PRIVACY_SECTIONS } from "./legalContent";

export function PrivacySections() {
  return (
    <div className="space-y-5 text-sm leading-relaxed text-gray-700">
      <p>{PRIVACY_INTRO}</p>
      {PRIVACY_SECTIONS.map((section) => (
        <section key={section.title}>
          <h3 className="mb-1.5 font-semibold text-gray-900">{section.title}</h3>
          {section.body && <p>{section.body}</p>}
          {section.items && (
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          )}
          {section.groups && (
            <div className="space-y-2">
              {section.groups.map((group) => (
                <div key={group.label}>
                  <p>• {group.label}</p>
                  <ul className="ml-4 space-y-1">
                    {group.items.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
