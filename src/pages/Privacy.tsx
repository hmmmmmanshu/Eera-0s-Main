import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: October 31, 2025</p>

        <p className="mb-6">
          At <strong>EERA OS</strong> by Acharya Ventures ("we", "us", "our"), we are committed to protecting your
          privacy. This policy explains what information we collect, how we use it, and your choices. This policy applies to
          our website, product, and related services (collectively, the "Services").
        </p>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold">Information We Collect</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Account and Profile Data: name, email address, organization details, preferences, and settings when you create
              or update an account.
            </li>
            <li>
              Authentication and Security Data: identifiers from our authentication provider (Supabase) and security signals
              to keep your account safe.
            </li>
            <li>
              Workspace and Content Data: content you create or upload within the Services, including tasks, notes,
              documents, and configuration.
            </li>
            <li>
              Calendar Data (Google Calendar): with your explicit consent during Google authorization, we may access your
              Google Calendar to read event metadata (titles, attendees, times) and create/update events you request. We do
              not access your Gmail or other Google data. You can revoke access at any time in your Google Account settings.
            </li>
            <li>
              Usage and Device Data: interactions with our product, pages visited, features used, device information, IP
              address, and approximate location for performance, analytics, and security.
            </li>
          </ul>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold">How We Use Information</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Provide, maintain, and improve the Services and core product features.</li>
            <li>Sync and manage calendar events when you authorize Google Calendar access.</li>
            <li>Personalize your experience and surface relevant insights across hubs.</li>
            <li>Monitor performance, debug issues, and enhance reliability and security.</li>
            <li>Communicate service updates, security notices, and transactional messages.</li>
            <li>Comply with legal obligations and enforce our terms and policies.</li>
          </ul>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold">Analytics and Session Recording</h2>
          <p>
            We use analytics tools to understand product usage and improve user experience. This may include Microsoft
            Clarity or a similar session analytics tool to capture anonymized or pseudonymized usage data, heatmaps, and
            session replays. These tools may record clicks, scrolling, and basic interactions. We configure them to avoid
            capturing sensitive fields wherever possible. You can opt out by using browser tracking protections or by
            contacting us, and we will provide an opt-out mechanism where applicable.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold">Google Calendar Access and Permissions</h2>
          <p>
            When you connect Google Calendar, we request only the scopes necessary to read your calendars and create or
            update events you explicitly schedule from EERA OS. We store minimal event metadata required to display and
            manage your schedule inside the product. You may disconnect access at any time within EERA OS or your Google
            Account permissions page. Disconnecting will stop future syncs and access.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold">Data Sharing</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Service Providers: We share data with vendors who help us host, process, and deliver the Services (e.g., cloud
              hosting, authentication, analytics). They access data only to perform services on our behalf and are bound by
              confidentiality and security obligations.
            </li>
            <li>Legal Compliance: We may share information as required by law or to protect rights, safety, and security.</li>
            <li>
              Business Transfers: In a merger, acquisition, or asset sale, user data may be transferred consistent with this
              policy, with notice as required by law.
            </li>
          </ul>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold">Data Retention</h2>
          <p>
            We retain personal information for as long as needed to provide the Services, comply with legal obligations,
            resolve disputes, and enforce agreements. You may request deletion of your account data, and we will process it
            subject to legal or legitimate business requirements.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold">Your Rights and Choices</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Access, correct, or delete certain personal information.</li>
            <li>Opt out of non-essential analytics and marketing communications.</li>
            <li>Revoke Google Calendar access at any time via your Google Account.</li>
          </ul>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold">Security</h2>
          <p>
            We implement technical and organizational measures to protect your data. No method of transmission or storage is
            completely secure; we strive to use industry best practices suitable for our Services and scale.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold">International Transfers</h2>
          <p>
            Your information may be processed in countries other than your own, where data protection laws may differ. We
            take steps to ensure appropriate safeguards are in place.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-2xl font-semibold">Contact Us</h2>
          <p>
            Questions or requests? Contact us at <a className="underline" href="mailto:hello@eera.app">hello@eera.app</a>.
            Public policy URL: <a className="underline" href="https://eera-os.com/privacy" target="_blank" rel="noreferrer">https://eera-os.com/privacy</a>.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;


