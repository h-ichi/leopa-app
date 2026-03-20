import React from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white text-gray-800">

      {/* ================= HERO ================= */}
<section className="py-24 text-center px-6">
  <h1 className="text-5xl font-bold mb-6">
    LEOPA LOG
  </h1>

  <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
    給餌・掃除・脱皮・排便・温湿度管理まで<br />
    毎日の記録をワンタップで。<br />
    レオパードゲッコー飼育ログアプリ。
  </p>

  <button
    onClick={() => navigate("/app")}
    className="px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-lg font-bold shadow-lg transition"
  >
    カレンダーに記録する（無料）
  </button>

  <p className="text-sm text-gray-500 mt-4 max-w-xl mx-auto">
    ※入力データはユーザーごとのブラウザに保存されるため、
    アカウント登録なしですぐにカレンダーへ記録できます。
    注意：キャッシュクリアするとデータは消失します。
  </p>
</section>



      {/* ================= FEATURES ================= */}
      <section className="py-20 px-6 bg-white">
        <h2 className="text-3xl font-bold text-center mb-14">
          できること
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">

          <Feature
            title="📅 カレンダー管理"
            text="月表示で一目でチェック。毎日の記録を可視化できます。"
          />

          <Feature
            title="🦎 個体別タブ"
            text="3匹まで個体ごとにログを分けて管理可能。"
          />

          <Feature
            title="💾 オフライン保存"
            text="ZIPファイルでバックアップ可能 
            ※キャッシュクリアするとブラウザ上のデータは消失します。"
          />

        </div>
      </section>

      {/* ================= HOW TO USE ================= */}

<section className="py-20 bg-gray-50">
  <div className="max-w-5xl mx-auto px-6">

    <h2 className="text-3xl font-bold text-center mb-12">
      使い方
    </h2>

    <div className="grid md:grid-cols-3 gap-8">

      {/* STEP 1 */}
      <div className="bg-white rounded-xl shadow p-6 text-center">
        <div className="text-4xl font-bold text-emerald-500 mb-3">
          1
        </div>

        <h3 className="font-semibold mb-2">
          記録する個体を選択
        </h3>

        <p className="text-gray-600 text-sm">
          レオパごとにタブで個体を切り替えられます。最大3匹までタブで切り替えることができます。
        </p>
      </div>

      {/* STEP 2 */}
      <div className="bg-white rounded-xl shadow p-6 text-center">
        <div className="text-4xl font-bold text-emerald-500 mb-3">
          2
        </div>

        <h3 className="font-semibold mb-2">
          日付を選択してデータ入力
        </h3>

        <p className="text-gray-600 text-sm">
          カレンダーの日付をクリックして温度・給餌・排便などを記録します。入力したデータはブラウザに自動保存されます。
          ※ブラウザや端末が変わるとデータは反映されません。またキャッシュクリアするとデータは消失します。
          バックアップZIPファイルにデータを読み込みこませて出力をすれば戻ります。
        </p>
      </div>

      {/* STEP 3 */}
      <div className="bg-white rounded-xl shadow p-6 text-center">
        <div className="text-4xl font-bold text-emerald-500 mb-3">
          3
        </div>

        <h3 className="font-semibold mb-2">
          お気に入り登録、スマートフォンのホーム画面に追加
        </h3>

        <p className="text-gray-600 text-sm">
          記録したデータを再度、閲覧する時にはお気に登録、あるいはホーム画面にブラウザ登録することができます。
        </p>
      </div>

    </div>
  </div>
</section>

      

      {/* ================= CTA ================= */}
      <section className="py-24 text-center bg-emerald-50">
        

        <button
          onClick={() => navigate("/app")}
          className="px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-lg font-bold shadow"
        >
          カレンダーを開く
        </button>
      </section>

      {/* ================= FOOTER ================= */}
<footer className="py-10 text-center text-sm text-gray-400">

<div className="mb-3 space-x-6">
  <Link to="/terms" className="hover:underline">
    利用規約
  </Link>

  <Link to="/privacy" className="hover:underline">
    プライバシーポリシー
  </Link>
</div>

<div>
  © 2026 Leopa Log
</div>

</footer>
    </div>
  );
};

/* ================= 小コンポーネント ================= */
const Feature: React.FC<{ title: string; text: string }> = ({ title, text }) => (
  <div className="p-8 rounded-2xl shadow bg-gray-50 text-center">
    <h4 className="text-xl font-bold mb-3">{title}</h4>
    <p className="text-gray-600">{text}</p>
  </div>
);

export default LandingPage;