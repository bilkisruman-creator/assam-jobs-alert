import { db } from '../src/lib/db';
import crypto from 'crypto';

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  console.log('🌱 Seeding database...');

  // Create default admin with the specified credentials
  const admin = await db.admin.upsert({
    where: { email: 'zahedurr7@gmail.com' },
    update: {},
    create: {
      email: 'zahedurr7@gmail.com',
      password: hashPassword('Rajuk7422@'),
      name: 'Admin',
      role: 'superadmin',
    },
  });
  console.log('✅ Admin created:', admin.email);

  // Create all 14 categories
  const categories = [
    { name: 'Latest Jobs', slug: 'latest-jobs', icon: 'Briefcase', color: '#16a34a', order: 1, description: 'Latest government job notifications in Assam and India' },
    { name: 'Results', slug: 'results', icon: 'Trophy', color: '#dc2626', order: 2, description: 'Exam results and merit lists' },
    { name: 'Admit Cards', slug: 'admit-cards', icon: 'CreditCard', color: '#9333ea', order: 3, description: 'Download admit cards and hall tickets' },
    { name: 'Admissions', slug: 'admissions', icon: 'GraduationCap', color: '#0891b2', order: 4, description: 'Admission notifications for schools, colleges, and universities' },
    { name: 'Scholarships', slug: 'scholarships', icon: 'Award', color: '#d97706', order: 5, description: 'Scholarship notifications and applications' },
    { name: 'Syllabus', slug: 'syllabus', icon: 'BookOpen', color: '#7c3aed', order: 6, description: 'Exam syllabus and study materials' },
    { name: 'Answer Key', slug: 'answer-key', icon: 'CheckCircle', color: '#059669', order: 7, description: 'Exam answer keys and solutions' },
    { name: 'Important Dates', slug: 'important-dates', icon: 'Calendar', color: '#e11d48', order: 8, description: 'Important dates and deadlines' },
    { name: 'Exam Preparation', slug: 'exam-preparation', icon: 'Brain', color: '#4f46e5', order: 9, description: 'Exam preparation tips and study guides' },
    { name: 'Notifications', slug: 'notifications', icon: 'Bell', color: '#ea580c', order: 10, description: 'Official notifications and announcements' },
    { name: 'Assam Govt Jobs', slug: 'assam-govt-jobs', icon: 'Landmark', color: '#0d9488', order: 11, description: 'Assam state government job notifications' },
    { name: 'Central Govt Jobs', slug: 'central-govt-jobs', icon: 'Building2', color: '#1d4ed8', order: 12, description: 'Central government job notifications' },
    { name: 'Private Jobs', slug: 'private-jobs', icon: 'Building', color: '#be185d', order: 13, description: 'Private sector job opportunities in Assam' },
    { name: 'Walk-in Interviews', slug: 'walk-in-interviews', icon: 'Users', color: '#65a30d', order: 14, description: 'Walk-in interview schedules and details' },
    { name: 'State Government Jobs', slug: 'state-government-jobs', icon: 'MapPin', color: '#0d9488', order: 15, description: 'All state government job notifications across India' },
  ];

  const createdCategories = [];
  for (const cat of categories) {
    const category = await db.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdCategories.push(category);
  }
  console.log(`✅ Created ${createdCategories.length} categories`);

  // Get category references
  const catLatestJobs = createdCategories[0];
  const catResults = createdCategories[1];
  const catAdmitCards = createdCategories[2];
  const catAdmissions = createdCategories[3];
  const catScholarships = createdCategories[4];
  const catSyllabus = createdCategories[5];
  const catAnswerKey = createdCategories[6];
  const catAssamGovt = createdCategories[10];
  const catCentralGovt = createdCategories[11];
  const catWalkIn = createdCategories[13];

  // Create demo posts
  const posts = [
    {
      title: 'APSC Combined Competitive Examination 2025 – 200+ Vacancies',
      slug: 'apsc-combined-competitive-examination-2025',
      excerpt: 'Assam Public Service Commission invites online applications for Combined Competitive Examination 2025 with 200+ vacancies across various departments.',
      content: JSON.stringify({
        overview: 'Assam Public Service Commission (APSC) has released the notification for Combined Competitive Examination 2025.',
        sections: [
          { title: 'Recruitment Details', content: 'Organization: Assam Public Service Commission\nPost Name: Combined Competitive Examination 2025\nTotal Vacancies: 200+\nJob Location: Assam' },
          { title: 'Eligibility', content: 'Educational Qualification: Bachelor\'s Degree from a recognized university\nAge Limit: 21-38 years (Age relaxation applicable)' },
          { title: 'Application Fee', content: 'General/OBC: Rs. 300/-\nSC/ST: Rs. 200/-\nBPL: No Fee' },
          { title: 'Salary/Pay Scale', content: 'Pay Band: Rs. 30,000/- to Rs. 1,10,000/-\nGrade Pay: Rs. 12,700/- to Rs. 17,000/-' },
          { title: 'Selection Process', content: '1. Preliminary Examination\n2. Main Examination\n3. Interview/Personality Test' },
        ]
      }),
      categoryId: catLatestJobs.id,
      templateType: 'job',
      status: 'published',
      isFeatured: true,
      isBreaking: true,
      isTrending: true,
      seoTitle: 'APSC CCE 2025 – 200+ Vacancies | Assam Jobs Alert',
      seoDescription: 'Apply online for APSC Combined Competitive Examination 2025.',
      seoKeywords: 'APSC CCE 2025, Assam PSC, Government Jobs Assam',
      viewCount: 15420,
      readTime: 8,
      publishedAt: new Date(),
    },
    {
      title: 'Assam Police Sub-Inspector Recruitment 2025 – 300 Posts',
      slug: 'assam-police-sub-inspector-recruitment-2025',
      excerpt: 'Assam Police has released notification for recruitment of 300 Sub-Inspector posts.',
      content: JSON.stringify({
        overview: 'Assam Police Recruitment Board has announced 300 Sub-Inspector vacancies.',
        sections: [
          { title: 'Recruitment Details', content: 'Organization: Assam Police\nPost Name: Sub-Inspector\nTotal Vacancies: 300\nJob Location: Assam' },
          { title: 'Eligibility', content: 'Graduate from a recognized university\nAge Limit: 20-26 years' },
          { title: 'Salary', content: 'Pay Band: Rs. 14,000/- to Rs. 49,000/-\nGrade Pay: Rs. 8,000/-' },
        ]
      }),
      categoryId: catAssamGovt.id,
      templateType: 'job',
      status: 'published',
      isFeatured: true,
      isBreaking: false,
      isTrending: true,
      seoTitle: 'Assam Police SI Recruitment 2025 – 300 Posts',
      seoDescription: 'Assam Police Sub-Inspector Recruitment 2025 notification released.',
      seoKeywords: 'Assam Police SI, Sub Inspector Recruitment',
      viewCount: 12850,
      readTime: 6,
      publishedAt: new Date(Date.now() - 86400000),
    },
    {
      title: 'HSLC Result 2025 Assam – SEBA Class 10th Results Declared',
      slug: 'hslc-result-2025-assam-seba',
      excerpt: 'SEBA has declared HSLC Result 2025 for Class 10th students. Check your results online now.',
      content: JSON.stringify({
        overview: 'Board of Secondary Education, Assam (SEBA) has officially declared the HSLC/AHM Examination Result 2025.',
        sections: [
          { title: 'Result Summary', content: 'Board: SEBA\nExam: HSLC/AHM 2025\nOverall Pass Percentage: 72.5%' },
          { title: 'Steps to Check Result', content: '1. Visit results.sebaonline.org\n2. Click on HSLC Result 2025\n3. Enter Roll Number\n4. View and download result' },
        ]
      }),
      categoryId: catResults.id,
      templateType: 'result',
      status: 'published',
      isFeatured: true,
      isBreaking: true,
      isTrending: true,
      seoTitle: 'HSLC Result 2025 Assam – SEBA Class 10th Results',
      seoDescription: 'Check SEBA HSLC Result 2025 online. Class 10th results declared.',
      seoKeywords: 'HSLC Result 2025, SEBA Result, Assam Class 10 Result',
      viewCount: 45230,
      readTime: 5,
      publishedAt: new Date(Date.now() - 172800000),
    },
    {
      title: 'HS Result 2025 Assam – AHSEC Class 12th Results',
      slug: 'hs-result-2025-assam-ahsec',
      excerpt: 'AHSEC has declared HS Result 2025 for Class 12th (Arts, Science, Commerce).',
      content: JSON.stringify({
        overview: 'Assam Higher Secondary Education Council (AHSEC) has declared the HS Examination Result 2025.',
        sections: [
          { title: 'Result Summary', content: 'Board: AHSEC\nStreams: Arts, Science, Commerce\nOverall Pass Percentage: 78.3%' },
          { title: 'Steps to Check', content: '1. Visit results.ahsec.nic.in\n2. Select stream\n3. Enter Roll Number\n4. View result' },
        ]
      }),
      categoryId: catResults.id,
      templateType: 'result',
      status: 'published',
      isFeatured: false,
      isBreaking: false,
      isTrending: true,
      seoTitle: 'HS Result 2025 Assam – AHSEC Class 12th Results',
      seoDescription: 'Check AHSEC HS Result 2025 online.',
      seoKeywords: 'HS Result 2025, AHSEC Result, Assam Class 12 Result',
      viewCount: 38900,
      readTime: 5,
      publishedAt: new Date(Date.now() - 259200000),
    },
    {
      title: 'GATE 2025 Admit Card Download – Direct Link',
      slug: 'gate-2025-admit-card-download',
      excerpt: 'GATE 2025 admit card has been released. Download your hall ticket now.',
      content: JSON.stringify({
        overview: 'Indian Institute of Technology has released the GATE 2025 Admit Card.',
        sections: [
          { title: 'Exam Overview', content: 'Organizing Institute: IIT Roorkee\nExam: GATE 2025\nMode: Computer Based Test\nDuration: 3 Hours' },
          { title: 'Download Process', content: '1. Visit GOAPS portal\n2. Login with Enrollment ID\n3. Download admit card' },
        ]
      }),
      categoryId: catAdmitCards.id,
      templateType: 'admit-card',
      status: 'published',
      isFeatured: false,
      isBreaking: true,
      isTrending: true,
      seoTitle: 'GATE 2025 Admit Card Download',
      seoDescription: 'Download GATE 2025 Admit Card from the official website.',
      seoKeywords: 'GATE 2025 Admit Card, GATE Hall Ticket',
      viewCount: 23100,
      readTime: 4,
      publishedAt: new Date(Date.now() - 345600000),
    },
    {
      title: 'Railway RRB NTPC 2025 Admit Card – Download Now',
      slug: 'railway-rrb-ntpc-2025-admit-card',
      excerpt: 'RRB has released NTPC 2025 admit card for CBT 2 examination.',
      content: JSON.stringify({
        overview: 'Railway Recruitment Board (RRB) has released the NTPC CBT 2 Admit Card 2025.',
        sections: [
          { title: 'Exam Overview', content: 'Organization: RRB\nExam: NTPC CBT 2 – 2025\nMode: Computer Based Test' },
          { title: 'Download Process', content: '1. Visit regional RRB website\n2. Enter Registration Number and DOB\n3. Download admit card' },
        ]
      }),
      categoryId: catAdmitCards.id,
      templateType: 'admit-card',
      status: 'published',
      isFeatured: false,
      isBreaking: false,
      isTrending: false,
      seoTitle: 'RRB NTPC 2025 Admit Card',
      seoDescription: 'Download RRB NTPC 2025 Admit Card.',
      seoKeywords: 'RRB NTPC Admit Card, Railway Admit Card',
      viewCount: 18900,
      readTime: 4,
      publishedAt: new Date(Date.now() - 432000000),
    },
    {
      title: 'Cotton University Admission 2025 – UG & PG Programs',
      slug: 'cotton-university-admission-2025',
      excerpt: 'Cotton University invites online applications for admission to UG and PG programs.',
      content: JSON.stringify({
        overview: 'Cotton University, Guwahati has opened admissions for UG and PG programs.',
        sections: [
          { title: 'Admission Overview', content: 'University: Cotton University\nSession: 2025-26\nPrograms: UG & PG\nMode: Online Application' },
          { title: 'Eligibility', content: 'UG: 10+2 with 50% marks\nPG: Bachelor\'s degree with 55% marks' },
          { title: 'Application Process', content: '1. Visit admission portal\n2. Register\n3. Fill form\n4. Upload documents\n5. Pay fee' },
        ]
      }),
      categoryId: catAdmissions.id,
      templateType: 'admission',
      status: 'published',
      isFeatured: false,
      isBreaking: false,
      isTrending: false,
      seoTitle: 'Cotton University Admission 2025',
      seoDescription: 'Apply for Cotton University Admission 2025.',
      seoKeywords: 'Cotton University Admission, Assam University Admission',
      viewCount: 8930,
      readTime: 6,
      publishedAt: new Date(Date.now() - 518400000),
    },
    {
      title: 'Dibrugarh University PhD Admission 2025',
      slug: 'dibrugarh-university-phd-admission-2025',
      excerpt: 'Dibrugarh University invites applications for PhD programs.',
      content: JSON.stringify({
        overview: 'Dibrugarh University has opened PhD admissions for session 2025-26.',
        sections: [
          { title: 'Admission Overview', content: 'University: Dibrugarh University\nProgram: PhD\nSelection: Entrance Test + Interview' },
          { title: 'Eligibility', content: 'Master\'s degree with 55% marks (50% for SC/ST/OBC)' },
        ]
      }),
      categoryId: catAdmissions.id,
      templateType: 'admission',
      status: 'published',
      isFeatured: false,
      isBreaking: false,
      isTrending: false,
      seoTitle: 'Dibrugarh University PhD Admission 2025',
      seoDescription: 'Apply for Dibrugarh University PhD Admission 2025.',
      seoKeywords: 'Dibrugarh University PhD, Assam PhD Admission',
      viewCount: 5430,
      readTime: 6,
      publishedAt: new Date(Date.now() - 604800000),
    },
    {
      title: 'National Scholarship Portal 2025 – Apply Now',
      slug: 'national-scholarship-portal-2025',
      excerpt: 'NSP 2025 is now open for applications. Apply for central and state government scholarships.',
      content: JSON.stringify({
        overview: 'National Scholarship Portal (NSP) 2025-26 is accepting applications.',
        sections: [
          { title: 'Scholarship Overview', content: 'Portal: NSP\nSession: 2025-26\nSchemes: 50+ Central & State Scholarships' },
          { title: 'Eligibility', content: 'Indian citizen\nFamily income below prescribed limit\nGood academic record' },
          { title: 'Benefits', content: 'Pre-Matric: Rs. 1,000-5,000/year\nPost-Matric: Rs. 5,000-15,000/year' },
        ]
      }),
      categoryId: catScholarships.id,
      templateType: 'scholarship',
      status: 'published',
      isFeatured: false,
      isBreaking: false,
      isTrending: true,
      seoTitle: 'National Scholarship Portal 2025 – Apply Online',
      seoDescription: 'Apply for NSP 2025 scholarships online.',
      seoKeywords: 'NSP 2025, National Scholarship Portal, Government Scholarships',
      viewCount: 19870,
      readTime: 7,
      publishedAt: new Date(Date.now() - 691200000),
    },
    {
      title: 'Pre-Matric Scholarship for SC Students Assam 2025',
      slug: 'pre-matric-scholarship-sc-students-assam-2025',
      excerpt: 'Apply for Pre-Matric Scholarship for SC students in Assam 2025.',
      content: JSON.stringify({
        overview: 'Government of Assam invites applications for Pre-Matric Scholarship for SC students.',
        sections: [
          { title: 'Scholarship Overview', content: 'Scheme: Pre-Matric Scholarship\nState: Assam\nClass: 9th & 10th' },
          { title: 'Eligibility', content: 'SC category\nFamily income below Rs. 2.5 lakh\nMinimum 50% attendance' },
          { title: 'Benefits', content: 'Day Scholars: Rs. 225/month\nHostellers: Rs. 450/month' },
        ]
      }),
      categoryId: catScholarships.id,
      templateType: 'scholarship',
      status: 'published',
      isFeatured: false,
      isBreaking: false,
      isTrending: false,
      seoTitle: 'Pre-Matric Scholarship SC Students Assam 2025',
      seoDescription: 'Apply for Pre-Matric Scholarship for SC students in Assam 2025.',
      seoKeywords: 'Pre-Matric Scholarship 2025, SC Scholarship Assam',
      viewCount: 7650,
      readTime: 5,
      publishedAt: new Date(Date.now() - 777600000),
    },
    {
      title: 'SSC CGL 2025 Notification – Various Group B & C Posts',
      slug: 'ssc-cgl-2025-notification',
      excerpt: 'Staff Selection Commission has released CGL 2025 notification for 15,000+ posts.',
      content: JSON.stringify({
        overview: 'SSC Combined Graduate Level Examination 2025 notification released.',
        sections: [
          { title: 'Recruitment Details', content: 'Organization: SSC\nExam: CGL 2025\nTotal Vacancies: 15,000+\nJob Location: All India' },
          { title: 'Eligibility', content: 'Bachelor\'s Degree\nAge Limit: 18-32 years' },
          { title: 'Salary', content: 'Group B: Level 7-8 (Rs. 44,900-1,42,400)\nGroup C: Level 2-4 (Rs. 19,900-63,200)' },
        ]
      }),
      categoryId: catCentralGovt.id,
      templateType: 'job',
      status: 'published',
      isFeatured: true,
      isBreaking: false,
      isTrending: true,
      seoTitle: 'SSC CGL 2025 Notification – 15,000+ Vacancies',
      seoDescription: 'SSC CGL 2025 notification released. 15,000+ vacancies.',
      seoKeywords: 'SSC CGL 2025, Staff Selection Commission',
      viewCount: 31200,
      readTime: 8,
      publishedAt: new Date(Date.now() - 864000000),
    },
    {
      title: 'Indian Army Agniveer Recruitment 2025',
      slug: 'indian-army-agniveer-recruitment-2025',
      excerpt: 'Indian Army Agniveer recruitment 2025 under Agnipath Scheme.',
      content: JSON.stringify({
        overview: 'Indian Army Agniveer Recruitment 2025 under the Agnipath Scheme.',
        sections: [
          { title: 'Details', content: 'Organization: Indian Army\nScheme: Agnipath\nTenure: 4 Years' },
          { title: 'Eligibility', content: 'Agniveer GD: 10th Pass\nAgniveer Technical: 12th Pass (Science)\nAge: 17.5 to 21 years' },
          { title: 'Salary', content: '1st Year: Rs. 30,000/-\n4th Year: Rs. 40,000/-\nSeva Nidhi: Rs. 11.71 Lakh' },
        ]
      }),
      categoryId: catCentralGovt.id,
      templateType: 'job',
      status: 'published',
      isFeatured: false,
      isBreaking: false,
      isTrending: false,
      seoTitle: 'Indian Army Agniveer Recruitment 2025',
      seoDescription: 'Indian Army Agniveer Recruitment 2025 under Agnipath Scheme.',
      seoKeywords: 'Agniveer 2025, Indian Army Recruitment, Agnipath',
      viewCount: 27800,
      readTime: 6,
      publishedAt: new Date(Date.now() - 950400000),
    },
    {
      title: 'Assam Secretariat Administrative Assistant 2025',
      slug: 'assam-secretariat-administrative-assistant-2025',
      excerpt: 'Assam Secretariat has released notification for Administrative Assistant with 150 vacancies.',
      content: JSON.stringify({
        overview: 'Assam Secretariat Administrative Assistant Recruitment 2025.',
        sections: [
          { title: 'Details', content: 'Organization: Assam Secretariat\nPost: Administrative Assistant\nVacancies: 150\nLocation: Guwahati' },
          { title: 'Eligibility', content: 'Graduate in any discipline\nComputer Knowledge: CCC\nTyping: 30 WPM English' },
          { title: 'Salary', content: 'Pay Band: Rs. 14,000 – 49,000/-\nGrade Pay: Rs. 6,200/-' },
        ]
      }),
      categoryId: catAssamGovt.id,
      templateType: 'job',
      status: 'published',
      isFeatured: false,
      isBreaking: false,
      isTrending: false,
      seoTitle: 'Assam Secretariat Administrative Assistant 2025',
      seoDescription: 'Assam Secretariat Administrative Assistant Recruitment 2025.',
      seoKeywords: 'Assam Secretariat Jobs, Administrative Assistant',
      viewCount: 11200,
      readTime: 5,
      publishedAt: new Date(Date.now() - 1036800000),
    },
    {
      title: 'Assam TET 2025 – Teacher Eligibility Test Notification',
      slug: 'assam-tet-2025-teacher-eligibility-test',
      excerpt: 'Assam TET 2025 notification released for LP and UP levels.',
      content: JSON.stringify({
        overview: 'Assam Teacher Eligibility Test (TET) 2025 notification released.',
        sections: [
          { title: 'Details', content: 'Exam: Assam TET 2025\nLevel: LP & UP\nBody: SEBA' },
          { title: 'Eligibility', content: 'LP TET: 12th + D.El.Ed\nUP TET: Graduate + B.Ed\nAge: 18-40 years' },
        ]
      }),
      categoryId: catLatestJobs.id,
      templateType: 'job',
      status: 'published',
      isFeatured: false,
      isBreaking: false,
      isTrending: false,
      seoTitle: 'Assam TET 2025 – Teacher Eligibility Test',
      seoDescription: 'Assam TET 2025 notification released.',
      seoKeywords: 'Assam TET 2025, Teacher Eligibility Test',
      viewCount: 16500,
      readTime: 7,
      publishedAt: new Date(Date.now() - 1123200000),
    },
    {
      title: 'Walk-in Interview: Project Assistant at IIT Guwahati 2025',
      slug: 'walk-in-interview-project-assistant-iit-guwahati-2025',
      excerpt: 'IIT Guwahati is conducting walk-in interview for Project Assistant positions.',
      content: JSON.stringify({
        overview: 'IIT Guwahati walk-in interviews for Project Assistant.',
        sections: [
          { title: 'Details', content: 'Organization: IIT Guwahati\nPost: Project Assistant\nDepartment: Civil Engineering\nDuration: 1 Year' },
          { title: 'Eligibility', content: 'B.E./B.Tech in Civil Engineering\nM.Tech preferred' },
          { title: 'Salary', content: 'Consolidated: Rs. 20,000 – 25,000/month' },
        ]
      }),
      categoryId: catWalkIn.id,
      templateType: 'job',
      status: 'published',
      isFeatured: false,
      isBreaking: false,
      isTrending: false,
      seoTitle: 'IIT Guwahati Walk-in Interview 2025',
      seoDescription: 'Walk-in interview at IIT Guwahati for Project Assistant.',
      seoKeywords: 'IIT Guwahati Walk-in, Project Assistant',
      viewCount: 3210,
      readTime: 3,
      publishedAt: new Date(Date.now() - 1209600000),
    },
  ];

  // Post creation with important dates and links
  const postDatesAndLinks: Record<string, { dates: { label: string; date: string }[]; links: { label: string; url: string; linkType: string }[] }> = {
    'apsc-combined-competitive-examination-2025': {
      dates: [
        { label: 'Notification Date', date: '2025-01-15' },
        { label: 'Online Apply Start', date: '2025-01-20' },
        { label: 'Online Apply End', date: '2025-02-28' },
        { label: 'Prelims Exam Date', date: '2025-04-15' },
      ],
      links: [
        { label: 'Apply Online', url: 'https://apsc.nic.in', linkType: 'apply' },
        { label: 'Official Notification', url: 'https://apsc.nic.in/notification.pdf', linkType: 'notification' },
        { label: 'Official Website', url: 'https://apsc.nic.in', linkType: 'official' },
      ]
    },
    'assam-police-sub-inspector-recruitment-2025': {
      dates: [
        { label: 'Online Apply Start', date: '2025-02-05' },
        { label: 'Online Apply End', date: '2025-03-10' },
        { label: 'Written Exam', date: '2025-05-20' },
      ],
      links: [
        { label: 'Apply Online', url: 'https://assampolice.gov.in', linkType: 'apply' },
        { label: 'Official Notification', url: 'https://assampolice.gov.in/notification.pdf', linkType: 'notification' },
        { label: 'Official Website', url: 'https://assampolice.gov.in', linkType: 'official' },
      ]
    },
    'hslc-result-2025-assam-seba': {
      dates: [
        { label: 'Result Declaration', date: '2025-03-15' },
        { label: 'Re-evaluation Start', date: '2025-03-20' },
        { label: 'Re-evaluation End', date: '2025-04-05' },
      ],
      links: [
        { label: 'Check Result', url: 'https://results.sebaonline.org', linkType: 'result' },
        { label: 'Official Website', url: 'https://sebaonline.org', linkType: 'official' },
      ]
    },
    'hs-result-2025-assam-ahsec': {
      dates: [
        { label: 'Result Declaration', date: '2025-03-25' },
        { label: 'Re-evaluation End', date: '2025-04-15' },
      ],
      links: [
        { label: 'Check Result', url: 'https://results.ahsec.nic.in', linkType: 'result' },
        { label: 'Official Website', url: 'https://ahsec.nic.in', linkType: 'official' },
      ]
    },
    'gate-2025-admit-card-download': {
      dates: [
        { label: 'Admit Card Release', date: '2025-01-05' },
        { label: 'Exam Date', date: '2025-02-01' },
      ],
      links: [
        { label: 'Download Admit Card', url: 'https://goaps.iitr.ac.in', linkType: 'download' },
        { label: 'Official Website', url: 'https://gate.iitr.ac.in', linkType: 'official' },
      ]
    },
    'railway-rrb-ntpc-2025-admit-card': {
      dates: [
        { label: 'Admit Card Release', date: '2025-02-10' },
        { label: 'CBT 2 Exam', date: '2025-02-25' },
      ],
      links: [
        { label: 'Download Admit Card', url: 'https://rrb.gov.in', linkType: 'download' },
        { label: 'Official Website', url: 'https://rrb.gov.in', linkType: 'official' },
      ]
    },
    'cotton-university-admission-2025': {
      dates: [
        { label: 'Application Start', date: '2025-04-10' },
        { label: 'Application End', date: '2025-05-15' },
        { label: 'Merit List', date: '2025-05-25' },
      ],
      links: [
        { label: 'Apply Online', url: 'https://cottonuniversity.ac.in/admission', linkType: 'apply' },
        { label: 'Official Website', url: 'https://cottonuniversity.ac.in', linkType: 'official' },
      ]
    },
    'dibrugarh-university-phd-admission-2025': {
      dates: [
        { label: 'Application Start', date: '2025-05-01' },
        { label: 'Application End', date: '2025-06-15' },
      ],
      links: [
        { label: 'Apply Online', url: 'https://dibru.ac.in/admission', linkType: 'apply' },
        { label: 'Official Website', url: 'https://dibru.ac.in', linkType: 'official' },
      ]
    },
    'national-scholarship-portal-2025': {
      dates: [
        { label: 'Application Start', date: '2025-08-01' },
        { label: 'Application End', date: '2025-11-30' },
      ],
      links: [
        { label: 'Apply Online', url: 'https://scholarships.gov.in', linkType: 'apply' },
        { label: 'Official Website', url: 'https://scholarships.gov.in', linkType: 'official' },
      ]
    },
    'pre-matric-scholarship-sc-students-assam-2025': {
      dates: [
        { label: 'Application Start', date: '2025-07-01' },
        { label: 'Application End', date: '2025-10-31' },
      ],
      links: [
        { label: 'Apply Online', url: 'https://scholarships.gov.in', linkType: 'apply' },
        { label: 'Official Website', url: 'https://scholarships.gov.in', linkType: 'official' },
      ]
    },
    'ssc-cgl-2025-notification': {
      dates: [
        { label: 'Notification Date', date: '2025-04-01' },
        { label: 'Online Apply End', date: '2025-05-05' },
        { label: 'Tier-I Exam', date: '2025-07-10' },
      ],
      links: [
        { label: 'Apply Online', url: 'https://ssc.nic.in', linkType: 'apply' },
        { label: 'Official Notification', url: 'https://ssc.nic.in/cgl2025.pdf', linkType: 'notification' },
        { label: 'Official Website', url: 'https://ssc.nic.in', linkType: 'official' },
      ]
    },
    'indian-army-agniveer-recruitment-2025': {
      dates: [
        { label: 'Online Apply Start', date: '2025-02-20' },
        { label: 'Online Apply End', date: '2025-03-20' },
        { label: 'Rally Date', date: '2025-05-01' },
      ],
      links: [
        { label: 'Apply Online', url: 'https://joinindianarmy.nic.in', linkType: 'apply' },
        { label: 'Official Website', url: 'https://joinindianarmy.nic.in', linkType: 'official' },
      ]
    },
    'assam-secretariat-administrative-assistant-2025': {
      dates: [
        { label: 'Online Apply Start', date: '2025-03-01' },
        { label: 'Online Apply End', date: '2025-04-01' },
      ],
      links: [
        { label: 'Apply Online', url: 'https://assamsecretariat.gov.in', linkType: 'apply' },
        { label: 'Official Website', url: 'https://assamsecretariat.gov.in', linkType: 'official' },
      ]
    },
    'assam-tet-2025-teacher-eligibility-test': {
      dates: [
        { label: 'Online Apply Start', date: '2025-03-10' },
        { label: 'Online Apply End', date: '2025-04-10' },
        { label: 'Exam Date', date: '2025-06-15' },
      ],
      links: [
        { label: 'Apply Online', url: 'https://sebaonline.org/tet', linkType: 'apply' },
        { label: 'Official Website', url: 'https://sebaonline.org', linkType: 'official' },
      ]
    },
    'walk-in-interview-project-assistant-iit-guwahati-2025': {
      dates: [
        { label: 'Walk-in Date', date: '2025-03-20' },
        { label: 'Reporting Time', date: '09:00 AM' },
      ],
      links: [
        { label: 'Official Notification', url: 'https://iitg.ac.in/notification', linkType: 'notification' },
        { label: 'Official Website', url: 'https://iitg.ac.in', linkType: 'official' },
      ]
    },
  };

  for (const postData of posts) {
    const existing = await db.post.findUnique({ where: { slug: postData.slug } });
    if (!existing) {
      const extras = postDatesAndLinks[postData.slug];
      await db.post.create({
        data: {
          ...postData,
          importantDates: extras ? { create: extras.dates } : undefined,
          importantLinks: extras ? { create: extras.links } : undefined,
        },
      });
    }
  }
  console.log(`✅ Created ${posts.length} demo posts`);

  // Create settings
  const settings = [
    { key: 'site_name', value: 'Assam Jobs Alert' },
    { key: 'site_tagline', value: 'Your Trusted Source for Assam Government Jobs & Education Updates' },
    { key: 'site_description', value: 'Assam Jobs Alert is the leading portal for Assam government job notifications, results, admit cards, admissions, and scholarships.' },
    { key: 'site_url', value: 'https://assamjobsalert.com' },
    { key: 'admin_email', value: 'zahedurr7@gmail.com' },
    { key: 'telegram_link', value: 'https://t.me/assamjobsalert' },
    { key: 'whatsapp_link', value: 'https://whatsapp.com/channel/assamjobsalert' },
    { key: 'youtube_link', value: 'https://youtube.com/@assamjobsalert' },
    { key: 'facebook_link', value: 'https://facebook.com/assamjobsalert' },
    { key: 'twitter_link', value: 'https://twitter.com/assamjobsalert' },
    { key: 'instagram_link', value: 'https://instagram.com/assamjobsalert' },
    { key: 'android_app_link', value: 'https://play.google.com/store/apps/details?id=com.assamjobsalert' },
    { key: 'posts_per_page', value: '12' },
    { key: 'enable_dark_mode', value: 'true' },
    { key: 'enable_push_notifications', value: 'true' },
    { key: 'enable_newsletter', value: 'true' },
    { key: 'maintenance_mode', value: 'false' },
    { key: 'primary_color', value: '#16a34a' },
    { key: 'accent_color', value: '#dc2626' },
    { key: 'robots_txt', value: 'User-agent: *\nAllow: /\nSitemap: https://assamjobsalert.com/sitemap.xml' },
  ];

  for (const setting of settings) {
    await db.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log(`✅ Created ${settings.length} settings`);

  // Create ad placements
  const ads = [
    { id: 'header-banner', title: 'Header Banner', code: '<!-- Header Ad -->', placement: 'header', order: 1, isActive: true },
    { id: 'sidebar-ad-1', title: 'Sidebar Ad 1', code: '<!-- Sidebar Ad -->', placement: 'sidebar', order: 1, isActive: true },
    { id: 'in-article-ad', title: 'In-Article Ad', code: '<!-- In-Article Ad -->', placement: 'in-article', order: 1, isActive: true },
    { id: 'footer-banner', title: 'Footer Banner', code: '<!-- Footer Ad -->', placement: 'footer', order: 1, isActive: true },
  ];

  for (const ad of ads) {
    await db.ad.upsert({
      where: { id: ad.id },
      update: {},
      create: ad,
    });
  }
  console.log(`✅ Created ${ads.length} ad placements`);

  console.log('🎉 Seed completed successfully!');
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
