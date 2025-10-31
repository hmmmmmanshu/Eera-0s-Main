import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: October 31, 2025</p>

        <p className="mb-6">
          These Terms of Service ("Terms") govern your access to and use of <strong>EERA OS</strong> by Acharya Ventures
          (the "Services"). By accessing or using the Services, you agree to be bound by these Terms.
        </p>

        <section className="space-y-3 mb-8">
          <h2 className="text-2xl font-semibold">1. Eligibility and Accounts</h2>
          <p>You must be able to form a binding contract to use the Services. You are responsible for your account, including keeping your credentials secure and accurate.</p>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-2xl font-semibold">2. Acceptable Use</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Do not misuse the Services, disrupt others, or attempt unauthorized access.</li>
            <li>Do not upload unlawful, infringing, or harmful content.</li>
            <li>Respect intellectual property rights and applicable laws.</li>
          </ul>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-2xl font-semibold">3. Google Calendar Integration</h2>
          <p>
            When you authorize Google Calendar access, you grant us permission to read event metadata and to create or
            update events on your behalf as requested through the Services. You can revoke access at any time in your Google
            Account settings. We will only request the minimum scopes necessary to deliver calendar features.
          </p>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-2xl font-semibold">4. Privacy</h2>
          <p>
            Your use of the Services is subject to our Privacy Policy. We may use analytics tools, such as Microsoft
            Clarity or similar, to understand usage and improve the Services. Please review our Privacy Policy to learn how
            we collect, use, and protect your information.
          </p>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-2xl font-semibold">5. Intellectual Property</h2>
          <p>
            The Services, including software, designs, and content, are owned by Acharya Ventures and its licensors. We
            grant you a limited, non-exclusive, non-transferable license to use the Services in accordance with these Terms.
          </p>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-2xl font-semibold">6. User Content</h2>
          <p>
            You retain ownership of content you submit. You grant us a limited license to process and display your content
            solely to operate and improve the Services. You are responsible for having necessary rights to the content you
            submit.
          </p>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-2xl font-semibold">7. Third-Party Services</h2>
          <p>
            The Services may integrate with third parties (e.g., Google, Supabase, analytics providers). Your use of third
            parties is subject to their terms and privacy policies.
          </p>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-2xl font-semibold">8. Disclaimers</h2>
          <p>
            The Services are provided "as is" without warranties of any kind, express or implied, including merchantability,
            fitness for a particular purpose, and non-infringement. We do not guarantee uninterrupted or error-free service.
          </p>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-2xl font-semibold">9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Acharya Ventures will not be liable for indirect, incidental, special,
            consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly,
            or any loss of data, use, goodwill, or other intangible losses, resulting from your use of the Services.
          </p>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-2xl font-semibold">10. Termination</h2>
          <p>
            We may suspend or terminate your access for violations of these Terms or if required by law. You may stop using
            the Services at any time. Certain provisions survive termination, including intellectual property, disclaimers,
            limitations of liability, and governing law.
          </p>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-2xl font-semibold">11. Changes to the Terms</h2>
          <p>
            We may update these Terms from time to time. Material changes will be communicated as appropriate. Continued use
            constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-2xl font-semibold">12. Contact</h2>
          <p>
            Questions about these Terms? Contact <a className="underline" href="mailto:hello@eera.app">hello@eera.app</a>.
            Public terms URL: <a className="underline" href="https://eera-os.com/terms" target="_blank" rel="noreferrer">https://eera-os.com/terms</a>.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;


