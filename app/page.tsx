'use client';

import { useEffect, useMemo, useState } from 'react';

type Feedback = {
  tone: 'success' | 'error';
  message: string;
};

type Lesson = {
  tag: string;
  title: string;
  lead: string;
  mission: string;
  point: string;
  starter: string;
  validate: (source: string) => string | null;
};

const STORAGE_KEY = 'tag-note-progress-v1';

const lessons: Lesson[] = [
  {
    tag: '<html>',
    title: 'ページの骨組み',
    lead: 'HTMLは、ブラウザにページの構造を伝えるための言葉です。まずは1枚のページを形にします。',
    mission: '<title>にページ名、<body>に<h1>を1つ書いてください。',
    point: '<head>はページの情報、<body>は画面に見える内容を入れる場所です。',
    starter: `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8">
    <title></title>
  </head>
  <body>
    <!-- ここに見出しを書こう -->
  </body>
</html>`,
    validate: (source) => {
      if (!/^\s*<!doctype html>/i.test(source)) return '先頭に <!doctype html> を残しましょう。';
      const doc = parseHtml(source);
      if (!doc.querySelector('title')?.textContent?.trim()) return '<title>にページ名を入れてください。';
      if (!doc.body.querySelector('h1')?.textContent?.trim()) return '<body>の中に、内容のある<h1>を1つ書いてください。';
      return null;
    },
  },
  {
    tag: '<h1>',
    title: '見出しと段落',
    lead: '見出しで話題を示し、段落で内容を説明すると、読み手にも検索エンジンにも伝わりやすくなります。',
    mission: '<h1>を1つ、その下に<p>を2つ以上書いて自己紹介を作ってください。',
    point: '<h1>はページ全体の主題です。文字を大きくする目的だけで使わないのがコツです。',
    starter: `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8">
    <title>わたしについて</title>
  </head>
  <body>
    <h1>わたしについて</h1>
    <!-- 好きなことを段落で紹介しよう -->
  </body>
</html>`,
    validate: (source) => {
      const doc = parseHtml(source);
      if (doc.body.querySelectorAll('h1').length !== 1) return '<h1>は1つだけにしましょう。';
      if (doc.body.querySelectorAll('p').length < 2) return '<p>を2つ以上書いてください。';
      return null;
    },
  },
  {
    tag: '<a>',
    title: 'リンクをつなぐ',
    lead: 'リンクは、ページとページをつなぐHTMLらしい要素です。行き先はhref属性で指定します。',
    mission: '好きなWebサイトへ移動する<a>を作り、リンクの説明も書いてください。',
    point: '「こちら」ではなく、移動先がわかる言葉をリンクにすると親切です。',
    starter: `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8">
    <title>おすすめサイト</title>
  </head>
  <body>
    <h1>おすすめサイト</h1>
    <p>
      <!-- hrefにURL、タグの間に説明を書こう -->
      <a href="">サイト名</a>
    </p>
  </body>
</html>`,
    validate: (source) => {
      const link = parseHtml(source).body.querySelector('a');
      if (!link) return '<a>を書いてください。';
      const href = link.getAttribute('href')?.trim() ?? '';
      if (!/^https?:\/\//i.test(href)) return 'hrefには https:// から始まるURLを入れてください。';
      if (!link.textContent?.trim() || link.textContent.trim() === 'サイト名') return 'リンク先がわかる説明を書いてください。';
      return null;
    },
  },
  {
    tag: '<ul>',
    title: 'リストで整理',
    lead: '同じ種類の情報が並ぶときはリストの出番です。まとまりをタグで表すと、情報の関係が明確になります。',
    mission: '<ul>と<li>を使って「やってみたいこと」を3つ以上並べてください。',
    point: '<ul>は順番のないリストです。手順のように順番が重要なら<ol>を使います。',
    starter: `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8">
    <title>やってみたいこと</title>
  </head>
  <body>
    <h1>やってみたいこと</h1>
    <ul>
      <li>小さなWebページを作る</li>
      <!-- あと2つ追加しよう -->
    </ul>
  </body>
</html>`,
    validate: (source) => {
      const list = parseHtml(source).body.querySelector('ul');
      if (!list) return '<ul>を書いてください。';
      const items = [...list.querySelectorAll(':scope > li')].filter((item) => item.textContent?.trim());
      if (items.length < 3) return '<ul>の中に、内容のある<li>を3つ以上書いてください。';
      return null;
    },
  },
  {
    tag: '<img>',
    title: '画像に意味をつける',
    lead: '画像には、表示できないときや画面を見られない人のために、内容を言葉で伝える役割があります。',
    mission: '<figure>の中にalt属性つきの<img>と、説明の<figcaption>を書いてください。',
    point: 'altには「画像」ではなく、その画像が伝えている内容を簡潔に書きます。',
    starter: `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8">
    <title>今日の一枚</title>
  </head>
  <body>
    <h1>今日の一枚</h1>
    <figure>
      <img
        src="https://images.unsplash.com/photo-1497250681960-ef046c08a56e?w=640"
        alt=""
      >
      <!-- 写真の説明を追加しよう -->
    </figure>
  </body>
</html>`,
    validate: (source) => {
      const figure = parseHtml(source).body.querySelector('figure');
      if (!figure) return '<figure>を書いてください。';
      const image = figure.querySelector('img');
      if (!image?.getAttribute('alt')?.trim()) return '<img>のalt属性に、画像の内容を書いてください。';
      if (!figure.querySelector('figcaption')?.textContent?.trim()) return '<figcaption>で写真の説明を追加してください。';
      return null;
    },
  },
  {
    tag: '<main>',
    title: '1ページを完成',
    lead: '最後は、これまでのタグを組み合わせます。内容の役割に合うタグを選ぶことが、HTML上達の近道です。',
    mission: '<main>の中に<h1>、<p>、3項目の<ul>、<a>を入れたプロフィールページを完成させてください。',
    point: '見た目ではなく「これは何か」でタグを選べたら、HTMLの基礎はできています。',
    starter: `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8">
    <title>わたしのプロフィール</title>
  </head>
  <body>
    <main>
      <h1>わたしのプロフィール</h1>
      <!-- 紹介文、好きなもの3つ、リンクを追加しよう -->
    </main>
  </body>
</html>`,
    validate: (source) => {
      const main = parseHtml(source).body.querySelector('main');
      if (!main) return '<main>を書いてください。';
      if (!main.querySelector('h1')?.textContent?.trim()) return '<main>の中に<h1>を書いてください。';
      if (!main.querySelector('p')?.textContent?.trim()) return '<main>の中に紹介文の<p>を書いてください。';
      if (main.querySelectorAll('ul > li').length < 3) return '<main>の中に3項目以上の<ul>を書いてください。';
      const link = main.querySelector('a');
      if (!link?.getAttribute('href')?.trim() || !link.textContent?.trim()) return '<main>の中に行き先と説明のある<a>を書いてください。';
      return null;
    },
  },
];

function parseHtml(source: string) {
  return new DOMParser().parseFromString(source, 'text/html');
}

function withPreviewStyle(source: string) {
  const previewStyle = `<style>
    :root { color-scheme: light; font-family: "Hiragino Sans", "Yu Gothic", sans-serif; }
    body { margin: 0; padding: 32px; color: #17302f; background: #fff; line-height: 1.75; }
    h1 { margin: 0 0 20px; font-size: clamp(28px, 6vw, 48px); line-height: 1.2; letter-spacing: .02em; }
    p, li { font-size: 16px; }
    a { color: #c43f30; text-underline-offset: 4px; }
    img { display: block; max-width: 100%; height: auto; }
    figure { margin: 0; }
    figcaption { margin-top: 10px; color: #526362; font-size: 14px; }
  </style>`;
  if (/<\/head>/i.test(source)) return source.replace(/<\/head>/i, `${previewStyle}</head>`);
  return `${previewStyle}${source}`;
}

export default function Home() {
  const [lessonIndex, setLessonIndex] = useState(0);
  const [codes, setCodes] = useState(() => lessons.map((lesson) => lesson.starter));
  const [completed, setCompleted] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [mobilePane, setMobilePane] = useState<'code' | 'preview'>('code');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as {
          lessonIndex?: number;
          codes?: string[];
          completed?: number[];
        };
        if (Number.isInteger(parsed.lessonIndex) && parsed.lessonIndex! >= 0 && parsed.lessonIndex! < lessons.length) {
          setLessonIndex(parsed.lessonIndex!);
        }
        if (Array.isArray(parsed.codes) && parsed.codes.length === lessons.length) setCodes(parsed.codes);
        if (Array.isArray(parsed.completed)) {
          setCompleted(parsed.completed.filter((item) => Number.isInteger(item) && item >= 0 && item < lessons.length));
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ lessonIndex, codes, completed }));
  }, [codes, completed, isReady, lessonIndex]);

  const lesson = lessons[lessonIndex];
  const code = codes[lessonIndex];
  const preview = useMemo(() => withPreviewStyle(code), [code]);
  const progress = Math.round((completed.length / lessons.length) * 100);
  const lineCount = code.split('\n').length;

  const selectLesson = (index: number) => {
    setLessonIndex(index);
    setFeedback(null);
    setMobilePane('code');
  };

  const updateCode = (value: string) => {
    setCodes((current) => current.map((item, index) => (index === lessonIndex ? value : item)));
    if (feedback) setFeedback(null);
  };

  const checkLesson = () => {
    const error = lesson.validate(code);
    if (error) {
      setFeedback({ tone: 'error', message: error });
      return;
    }
    setCompleted((current) => (current.includes(lessonIndex) ? current : [...current, lessonIndex]));
    setFeedback({
      tone: 'success',
      message: lessonIndex === lessons.length - 1 ? '全レッスン完了です。最初のHTMLページを自分の力で組み立てられました。' : 'できました。タグの役割が正しく伝わっています。',
    });
    setMobilePane('preview');
  };

  const restoreStarter = () => {
    if (!window.confirm('このレッスンのコードを最初の状態に戻しますか？')) return;
    updateCode(lesson.starter);
    setCompleted((current) => current.filter((item) => item !== lessonIndex));
    setFeedback(null);
  };

  const resetCourse = () => {
    if (!window.confirm('すべてのコードと進み具合をリセットしますか？')) return;
    setCodes(lessons.map((item) => item.starter));
    setCompleted([]);
    setLessonIndex(0);
    setFeedback(null);
    setMobilePane('code');
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#workspace" aria-label="タグの練習帳 ホーム">
          <span className="brand-mark" aria-hidden="true">&lt;/&gt;</span>
          <span>
            <strong>タグの練習帳</strong>
            <small>HTML FIRST STEPS</small>
          </span>
        </a>
        <div className="topbar-progress" aria-label={`学習の進み具合 ${progress}%`}>
          <span>{completed.length} / {lessons.length} LESSONS</span>
          <span className="progress-track" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </span>
          <strong>{progress}%</strong>
        </div>
        <button className="text-button" type="button" onClick={resetCourse}>進み具合をリセット</button>
      </header>

      <div className="learning-layout">
        <aside className="lesson-rail" aria-label="レッスン一覧">
          <div className="rail-heading">
            <span>COURSE 01</span>
            <p>HTMLの基本</p>
          </div>
          <ol className="lesson-list">
            {lessons.map((item, index) => {
              const done = completed.includes(index);
              const current = index === lessonIndex;
              return (
                <li key={item.tag}>
                  <button
                    className={`lesson-link${current ? ' is-current' : ''}${done ? ' is-done' : ''}`}
                    type="button"
                    onClick={() => selectLesson(index)}
                    aria-current={current ? 'step' : undefined}
                  >
                    <span className="lesson-number">{String(index + 1).padStart(2, '0')}</span>
                    <span className="lesson-tag">{item.tag}</span>
                    <span className="lesson-name">{item.title}</span>
                    <span className="lesson-state" aria-label={done ? '完了' : '未完了'}>{done ? '✓' : '·'}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="rail-note"><span aria-hidden="true">⌘</span> + Enter でも答え合わせ</p>
        </aside>

        <section className="lesson-stage" id="workspace">
          <div className="lesson-intro">
            <div className="lesson-kicker">
              <span>LESSON {String(lessonIndex + 1).padStart(2, '0')}</span>
              <code>{lesson.tag}</code>
            </div>
            <div className="lesson-copy">
              <h1>{lesson.title}</h1>
              <p>{lesson.lead}</p>
            </div>
            <div className="mission-note">
              <span className="mission-label">今回のミッション</span>
              <p>{lesson.mission}</p>
            </div>
          </div>

          <div className="workspace-tabs" role="tablist" aria-label="作業画面の切り替え">
            <button
              type="button"
              role="tab"
              aria-selected={mobilePane === 'code'}
              className={mobilePane === 'code' ? 'is-active' : ''}
              onClick={() => setMobilePane('code')}
            >コードを書く</button>
            <button
              type="button"
              role="tab"
              aria-selected={mobilePane === 'preview'}
              className={mobilePane === 'preview' ? 'is-active' : ''}
              onClick={() => setMobilePane('preview')}
            >結果を見る</button>
          </div>

          <div className="workbench">
            <section className={`code-panel${mobilePane === 'code' ? ' mobile-active' : ''}`} aria-label="HTMLコード入力">
              <div className="panel-bar code-bar">
                <span><i aria-hidden="true" /> index.html</span>
                <span>{lineCount} LINES</span>
              </div>
              <div className="editor-wrap">
                <div className="line-numbers" aria-hidden="true">
                  {Array.from({ length: lineCount }, (_, index) => <span key={index}>{index + 1}</span>)}
                </div>
                <textarea
                  value={code}
                  onChange={(event) => updateCode(event.target.value)}
                  onKeyDown={(event) => {
                    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                      event.preventDefault();
                      checkLesson();
                    }
                  }}
                  aria-label="HTMLコード"
                  spellCheck={false}
                />
              </div>
            </section>

            <section className={`preview-panel${mobilePane === 'preview' ? ' mobile-active' : ''}`} aria-label="プレビュー">
              <div className="panel-bar preview-bar">
                <span className="browser-dots" aria-hidden="true"><i /><i /><i /></span>
                <span className="address">preview.local</span>
                <span className="live-label"><i aria-hidden="true" /> LIVE</span>
              </div>
              <iframe title="入力したHTMLのプレビュー" srcDoc={preview} sandbox="" />
            </section>
          </div>

          <div className="lesson-footer">
            <div className="point-note">
              <span aria-hidden="true">!</span>
              <p><strong>覚えておくこと</strong>{lesson.point}</p>
            </div>
            <div className="lesson-actions">
              <button className="secondary-button" type="button" onClick={restoreStarter}>最初のコードに戻す</button>
              <button className="check-button" type="button" onClick={checkLesson}>
                できたか確認 <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>

          <div className="feedback-slot" aria-live="polite" aria-atomic="true">
            {feedback && (
              <div className={`feedback feedback-${feedback.tone}`}>
                <span className="feedback-icon" aria-hidden="true">{feedback.tone === 'success' ? '✓' : '!'}</span>
                <p>{feedback.message}</p>
                {feedback.tone === 'success' && lessonIndex < lessons.length - 1 && (
                  <button type="button" onClick={() => selectLesson(lessonIndex + 1)}>次のレッスンへ</button>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
