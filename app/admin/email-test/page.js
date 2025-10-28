import EmailTester from '@/components/EmailTester';

export const metadata = {
  title: 'Email Notification Tester - Admin',
  description: 'Test and preview email notification system',
};

export default function EmailTestPage() {
  return (
    <main>
      <EmailTester />
    </main>
  );
}