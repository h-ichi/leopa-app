export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">プライバシーポリシー</h1>

      <p className="mb-4">
        LEOPA LOG（以下「本サービス」）では、利用者のプライバシーを尊重し、
        個人情報の保護に努めます。
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">1. 取得する情報</h2>
      <p>
        本サービスでは、ユーザー登録機能はなく、
        個人を特定する情報の収集は行っていません。
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">2. データ保存について</h2>
      <p>
        飼育ログのデータは、ユーザーのブラウザ内（IndexedDB）に保存されます。
        サーバーへ送信されることはありません。
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">3. アクセス解析</h2>
      <p>
        本サービスでは、サービス改善のためにアクセス解析ツールを使用する場合があります。
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">4. 広告について</h2>
      <p>
        将来的にGoogle AdSenseなどの広告サービスを利用する可能性があります。
        その場合、Cookieを使用することがあります。
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">5. 免責事項</h2>
      <p>
        本サービスの利用によって生じた損害について、
        運営者は責任を負いかねます。
      </p>

      <p className="mt-10 text-sm text-gray-500">
        最終更新日：2026年3月
      </p>
    </div>
  );
}