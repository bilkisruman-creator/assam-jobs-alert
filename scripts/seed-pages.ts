import { db } from '../src/lib/db';

const defaultPages = [
  {
    title: 'About Us',
    slug: 'about-us',
    status: 'published',
    order: 1,
    content: `
      <h2>About Assam Jobs Alert</h2>
      <p>Welcome to <strong>Assam Jobs Alert</strong> — your most trusted and comprehensive source for Assam Government Jobs, Results, Admit Cards, Admissions, and Scholarships.</p>
      
      <h3>Our Mission</h3>
      <p>We are dedicated to providing accurate, timely, and up-to-date information about government job opportunities, educational notifications, and career-related updates for the people of Assam and the Northeast region.</p>
      
      <h3>What We Cover</h3>
      <ul>
        <li><strong>Government Jobs</strong> — Latest notifications from Assam State Government, Central Government, Defence, Banking, and other sectors</li>
        <li><strong>Results</strong> — Exam results, merit lists, and selection updates</li>
        <li><strong>Admit Cards</strong> — Download links and updates for various examination admit cards</li>
        <li><strong>Admissions</strong> — Admission notifications for schools, colleges, and universities</li>
        <li><strong>Scholarships</strong> — Scholarship opportunities for students across all levels</li>
        <li><strong>Answer Keys & Syllabus</strong> — Exam preparation materials and resources</li>
      </ul>
      
      <h3>Why Choose Us?</h3>
      <p>We understand the challenges job seekers face in finding reliable information. Our team works round the clock to ensure that every notification, update, and announcement reaches you at the earliest. We verify information from official sources before publishing.</p>
      
      <h3>Stay Connected</h3>
      <p>Join our <strong>Telegram Channel</strong> and <strong>WhatsApp Group</strong> to receive instant job alerts directly on your phone. Never miss an important notification again!</p>
      <p>Assam Jobs Alert — <em>Your gateway to government opportunities in Assam!</em></p>
    `,
  },
  {
    title: 'Contact Us',
    slug: 'contact-us',
    status: 'published',
    order: 2,
    content: `
      <h2>Get In Touch</h2>
      <p>We'd love to hear from you! Whether you have a question, suggestion, or feedback, feel free to reach out to us.</p>
      
      <h3>Contact Information</h3>
      <ul>
        <li><strong>Email:</strong> contact@assamjobsalert.com</li>
        <li><strong>Website:</strong> assamjobsalert.com</li>
      </ul>
      
      <h3>Connect With Us</h3>
      <p>Stay updated through our social media channels:</p>
      <ul>
        <li><strong>Telegram:</strong> Join our Telegram Channel for instant job alerts</li>
        <li><strong>WhatsApp:</strong> Join our WhatsApp Group for discussions and updates</li>
        <li><strong>YouTube:</strong> Subscribe for video guides and exam preparation tips</li>
        <li><strong>Facebook:</strong> Follow us for regular updates</li>
      </ul>
      
      <h3>For Job Notifications & Corrections</h3>
      <p>If you find any incorrect information or broken links on our website, please let us know. We strive to provide accurate and up-to-date information, and your feedback helps us improve.</p>
      
      <h3>For Advertisements & Partnerships</h3>
      <p>Interested in advertising with us or forming a partnership? Visit our <a href="/page/advertise-with-us">Advertise With Us</a> page for more details.</p>
    `,
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    status: 'published',
    order: 3,
    content: `
      <h2>Privacy Policy</h2>
      <p><em>Last updated: January 2025</em></p>
      
      <h3>Information We Collect</h3>
      <p>We collect information you provide directly to us, such as:</p>
      <ul>
        <li><strong>Email Address:</strong> When you subscribe to our newsletter or job alerts</li>
        <li><strong>Usage Data:</strong> We collect anonymous usage data to improve our website and user experience</li>
        <li><strong>Cookies:</strong> We use cookies to remember your preferences (such as dark/light mode) and to analyze website traffic</li>
      </ul>
      
      <h3>How We Use Your Information</h3>
      <ul>
        <li>To send you job alerts and notifications you've subscribed to</li>
        <li>To improve our website and services</li>
        <li>To analyze usage patterns and optimize content</li>
        <li>To communicate important updates about our services</li>
      </ul>
      
      <h3>Information Sharing</h3>
      <p>We do <strong>NOT</strong> sell, trade, or rent your personal information to third parties. We may share anonymized, aggregated data for analytical purposes only.</p>
      
      <h3>Cookies & Tracking</h3>
      <p>We use essential cookies for website functionality and optional analytics cookies to understand how visitors use our site. You can control cookie preferences through your browser settings.</p>
      
      <h3>Third-Party Links</h3>
      <p>Our website may contain links to external websites (such as official government portals). We are not responsible for the privacy practices of these third-party sites. We encourage you to read their privacy policies.</p>
      
      <h3>Data Security</h3>
      <p>We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure.</p>
      
      <h3>Your Rights</h3>
      <p>You can unsubscribe from our email alerts at any time by clicking the "Unsubscribe" link in any email. You can also contact us to request deletion of your data.</p>
      
      <h3>Changes to This Policy</h3>
      <p>We may update this privacy policy from time to time. We will notify you of significant changes by posting a notice on our website.</p>
      
      <h3>Contact Us</h3>
      <p>If you have any questions about this Privacy Policy, please <a href="/page/contact-us">contact us</a>.</p>
    `,
  },
  {
    title: 'Disclaimer',
    slug: 'disclaimer',
    status: 'published',
    order: 4,
    content: `
      <h2>Disclaimer</h2>
      
      <h3>General Disclaimer</h3>
      <p>The information provided on <strong>Assam Jobs Alert</strong> (assamjobsalert.com) is for general informational purposes only. While we strive to provide accurate and up-to-date information, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability of the information.</p>
      
      <h3>Not an Official Government Website</h3>
      <p><strong>Assam Jobs Alert is NOT an official government website.</strong> We are an independent informational portal that aggregates and publishes job notifications, results, and educational updates from various official sources for the convenience of job seekers.</p>
      
      <h3>Information Accuracy</h3>
      <ul>
        <li>We verify information from official sources before publishing, but errors may occur</li>
        <li>Always cross-check important details with the official notification or website</li>
        <li>We are not responsible for any decisions made based on the information provided on this website</li>
        <li>Job notifications, eligibility criteria, and deadlines may change — always refer to the official source</li>
      </ul>
      
      <h3>External Links</h3>
      <p>Our website contains links to external websites, including official government portals. These links are provided for convenience and informational purposes only. We do not endorse or take responsibility for the content of external websites.</p>
      
      <h3>Copyright Notice</h3>
      <p>All content published on this website, including text, images, and other materials, is either original content or sourced from publicly available official notifications. If you believe any content on this site infringes your copyright, please <a href="/page/dmca">refer to our DMCA page</a>.</p>
      
      <h3>Liability</h3>
      <p>In no event shall Assam Jobs Alert be liable for any loss or damage, including without limitation, indirect or consequential loss or damage, arising from the use of this website.</p>
      
      <h3>Changes</h3>
      <p>We reserve the right to modify this disclaimer at any time. Changes will be posted on this page.</p>
    `,
  },
  {
    title: 'Terms & Conditions',
    slug: 'terms-and-conditions',
    status: 'published',
    order: 5,
    content: `
      <h2>Terms & Conditions</h2>
      <p><em>Last updated: January 2025</em></p>
      
      <h3>Acceptance of Terms</h3>
      <p>By accessing and using Assam Jobs Alert (assamjobsalert.com), you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use this website.</p>
      
      <h3>Use of Website</h3>
      <ul>
        <li>This website is provided for personal, non-commercial use</li>
        <li>You may not use this website for any unlawful purpose</li>
        <li>You may not attempt to gain unauthorized access to any part of the website</li>
        <li>You may not reproduce, distribute, or modify content without prior permission</li>
      </ul>
      
      <h3>User Responsibilities</h3>
      <ul>
        <li>Verify all information from official sources before taking any action</li>
        <li>Do not submit false or misleading information</li>
        <li>Respect the intellectual property rights of others</li>
        <li>Comply with all applicable laws and regulations</li>
      </ul>
      
      <h3>Email Subscription</h3>
      <p>By subscribing to our email alerts, you consent to receive periodic emails about job notifications and updates. You can unsubscribe at any time using the link provided in each email.</p>
      
      <h3>Intellectual Property</h3>
      <p>All content on this website, including text, graphics, logos, and software, is the property of Assam Jobs Alert or its content suppliers and is protected by intellectual property laws.</p>
      
      <h3>Limitation of Liability</h3>
      <p>Assam Jobs Alert shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use this website or its content.</p>
      
      <h3>Changes to Terms</h3>
      <p>We reserve the right to modify these terms at any time. Continued use of the website after changes constitutes acceptance of the new terms.</p>
      
      <h3>Governing Law</h3>
      <p>These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Assam, India.</p>
    `,
  },
  {
    title: 'Advertise With Us',
    slug: 'advertise-with-us',
    status: 'published',
    order: 6,
    content: `
      <h2>Advertise With Assam Jobs Alert</h2>
      
      <h3>Why Advertise With Us?</h3>
      <p>Assam Jobs Alert is one of the fastest-growing job portals in Assam, reaching thousands of job seekers, students, and professionals every day. By advertising with us, you can:</p>
      <ul>
        <li><strong>Reach a targeted audience</strong> — Our visitors are actively seeking jobs, education, and career opportunities</li>
        <li><strong>High engagement rates</strong> — Our users spend significant time browsing job notifications and educational content</li>
        <li><strong>Affordable rates</strong> — We offer competitive pricing for all advertising formats</li>
        <li><strong>Multiple ad formats</strong> — Choose from banner ads, sponsored posts, newsletter ads, and more</li>
      </ul>
      
      <h3>Advertising Options</h3>
      <ul>
        <li><strong>Header Banner</strong> — Prominent placement at the top of every page</li>
        <li><strong>Sidebar Ads</strong> — Displayed alongside content for high visibility</li>
        <li><strong>In-Content Ads</strong> — Native advertising within article content</li>
        <li><strong>Newsletter Sponsorship</strong> — Reach our subscriber base directly via email</li>
        <li><strong>Sponsored Posts</strong> — Dedicated posts featuring your brand or opportunity</li>
      </ul>
      
      <h3>Audience Demographics</h3>
      <ul>
        <li>Primary audience: Job seekers aged 18-35 from Assam and Northeast India</li>
        <li>Secondary audience: Students, working professionals, and educators</li>
        <li>Monthly visitors: Growing rapidly</li>
      </ul>
      
      <h3>Get Started</h3>
      <p>Interested in advertising? <a href="/page/contact-us">Contact us</a> with your requirements, and our team will get back to you with customized options and pricing.</p>
      <p>We look forward to partnering with you!</p>
    `,
  },
  {
    title: 'DMCA',
    slug: 'dmca',
    status: 'published',
    order: 7,
    content: `
      <h2>DMCA — Digital Millennium Copyright Act</h2>
      
      <h3>Copyright Policy</h3>
      <p>Assam Jobs Alert respects the intellectual property rights of others and expects its users to do the same. We take copyright infringement seriously and will respond to notices of alleged copyright infringement that comply with applicable law.</p>
      
      <h3>Reporting Copyright Infringement</h3>
      <p>If you believe that any content on our website infringes your copyright, please provide us with the following information:</p>
      <ul>
        <li><strong>Identification</strong> — A description of the copyrighted work you claim has been infringed</li>
        <li><strong>Location</strong> — The URL or specific location on our website where the infringing material appears</li>
        <li><strong>Contact Information</strong> — Your name, address, telephone number, and email address</li>
        <li><strong>Statement of Good Faith</strong> — A statement that you believe the use of the material is not authorized by the copyright owner</li>
        <li><strong>Statement of Accuracy</strong> — A statement, under penalty of perjury, that the information in the notice is accurate</li>
        <li><strong>Signature</strong> — Your physical or electronic signature</li>
      </ul>
      
      <h3>How to Submit a DMCA Notice</h3>
      <p>Please send all DMCA notices to: <strong>contact@assamjobsalert.com</strong></p>
      
      <h3>Counter-Notification</h3>
      <p>If you believe that your content was removed or disabled as a result of a mistake or misidentification, you may submit a counter-notification with the required information under the DMCA.</p>
      
      <h3>Our Response</h3>
      <p>Upon receiving a valid DMCA notice, we will:</p>
      <ul>
        <li>Remove or disable access to the allegedly infringing material</li>
        <li>Notify the content provider that the material has been removed</li>
        <li>Take appropriate action against repeat infringers</li>
      </ul>
      
      <h3>Fair Use</h3>
      <p>Some content on our website may be used under fair use principles for the purpose of reporting news, providing commentary, or educating the public about job opportunities. If you have concerns about specific content, please contact us first.</p>
    `,
  },
  {
    title: 'Sitemap',
    slug: 'sitemap',
    status: 'published',
    order: 8,
    content: `
      <h2>Sitemap</h2>
      <p>Browse all sections and pages of Assam Jobs Alert.</p>
      
      <h3>Job Categories</h3>
      <ul>
        <li><a href="/category/latest-jobs">Latest Jobs</a></li>
        <li><a href="/category/assam-govt-jobs">Assam Government Jobs</a></li>
        <li><a href="/category/central-govt-jobs">Central Government Jobs</a></li>
        <li><a href="/category/defence-jobs">Defence Jobs</a></li>
        <li><a href="/category/bank-jobs">Bank Jobs</a></li>
        <li><a href="/category/walk-in-interviews">Walk-in Interviews</a></li>
      </ul>
      
      <h3>Education</h3>
      <ul>
        <li><a href="/category/results">Results</a></li>
        <li><a href="/category/admit-cards">Admit Cards</a></li>
        <li><a href="/category/admissions">Admissions</a></li>
        <li><a href="/category/scholarships">Scholarships</a></li>
        <li><a href="/category/answer-keys">Answer Keys</a></li>
        <li><a href="/category/syllabus">Syllabus</a></li>
      </ul>
      
      <h3>More</h3>
      <ul>
        <li><a href="/category/notifications">Notifications</a></li>
        <li><a href="/category/important-dates">Important Dates</a></li>
        <li><a href="/category/exam-preparation">Exam Preparation</a></li>
      </ul>
      
      <h3>Information Pages</h3>
      <ul>
        <li><a href="/page/about-us">About Us</a></li>
        <li><a href="/page/contact-us">Contact Us</a></li>
        <li><a href="/page/privacy-policy">Privacy Policy</a></li>
        <li><a href="/page/disclaimer">Disclaimer</a></li>
        <li><a href="/page/terms-and-conditions">Terms & Conditions</a></li>
        <li><a href="/page/advertise-with-us">Advertise With Us</a></li>
        <li><a href="/page/dmca">DMCA</a></li>
      </ul>
    `,
  },
];

async function main() {
  console.log('Seeding default pages...');
  
  for (const page of defaultPages) {
    const existing = await db.page.findUnique({ where: { slug: page.slug } });
    if (!existing) {
      await db.page.create({ data: page });
      console.log(`✅ Created page: ${page.title}`);
    } else {
      console.log(`⏭️  Page already exists: ${page.title}`);
    }
  }
  
  console.log('Done!');
}

main()
  .catch((e) => {
    console.error('Error seeding pages:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
