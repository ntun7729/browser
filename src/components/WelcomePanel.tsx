import type { SuggestionGroup } from "../types";

interface WelcomePanelProps {
  onLaunch: (value: string) => void;
}

const groups: SuggestionGroup[] = [
  {
    title: "Start fast",
    items: [
      { label: "OpenAI", value: "https://openai.com", helper: "AI tools and docs" },
      { label: "MDN", value: "https://developer.mozilla.org", helper: "Web platform reference" },
      { label: "GitHub", value: "https://github.com", helper: "Repos and issues" }
    ]
  },
  {
    title: "Termux setup",
    items: [
      { label: "Ubuntu packages", value: "libgtk-3-0 libnss3 libasound2", helper: "Core Electron runtime bits" },
      { label: "Termux:X11", value: "https://wiki.termux.com/wiki/Graphical_Environment", helper: "GUI bridge for Android" },
      { label: "Prism README", value: "https://github.com/ntun7729/browser", helper: "Project install notes" }
    ]
  }
];

export function WelcomePanel({ onLaunch }: WelcomePanelProps) {
  return (
    <section className="welcome-panel">
      <div className="welcome-panel__intro">
        <p className="eyebrow">Serious v1</p>
        <h2>A browser shell built for mobile Linux reality and daily desktop work.</h2>
        <p>
          Prism is structured for Electron stability, Vite-speed iteration, and a clean
          surface that feels intentional on narrow Android windows and larger laptop screens.
        </p>
      </div>

      <div className="suggestion-grid">
        {groups.map((group) => (
          <div className="suggestion-group" key={group.title}>
            <header>
              <h3>{group.title}</h3>
            </header>
            <div className="suggestion-list">
              {group.items.map((item) => (
                <button
                  className="suggestion-item"
                  key={item.label}
                  onClick={() => onLaunch(item.value)}
                  type="button"
                >
                  <strong>{item.label}</strong>
                  <span>{item.helper}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
