export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-carbon mb-4">About WeedZilla</h1>
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <p className="text-gray-600">
          WeedZilla is a community platform for Australian bush regenerators to
          share their weed removal wins. Upload photos of weeds you&apos;ve
          removed or share before &amp; after transformations of sites
          you&apos;ve restored.
        </p>
        <p className="text-gray-600">
          Each week, the community votes on the best submissions. Top posts earn
          gold, silver, and bronze awards. Track your progress, discover common
          invasive species, and connect with fellow regenerators.
        </p>
        <p className="text-sm text-gray-400">
          Have feedback or questions? Get in touch at{" "}
          <a
            href="mailto:support@weedzilla.app"
            className="text-eucalypt hover:underline"
          >
            support@weedzilla.app
          </a>
        </p>
      </div>
    </div>
  );
}
