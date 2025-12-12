const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...\n');

    // 1. Create Admin User
    console.log('📝 Creating admin user...');
    const adminPassword = await bcrypt.hash('admin', 10);
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@cvbuilder.com' },
      update: {
        role: 'ADMIN',
        password: adminPassword,
      },
      create: {
        email: 'admin@cvbuilder.com',
        name: 'Admin User',
        password: adminPassword,
        role: 'ADMIN',
      },
    });
    console.log('✅ Admin user created:');
    console.log('   Email: admin@cvbuilder.com');
    console.log('   Password: admin\n');

    // 2. Create Test User
    console.log('📝 Creating test user...');
    const testPassword = await bcrypt.hash('test123', 10);
    
    const testUser = await prisma.user.upsert({
      where: { email: 'test@cvbuilder.com' },
      update: {
        password: testPassword,
      },
      create: {
        email: 'test@cvbuilder.com',
        name: 'Test User',
        password: testPassword,
        role: 'USER',
      },
    });
    console.log('✅ Test user created:');
    console.log('   Email: test@cvbuilder.com');
    console.log('   Password: test123\n');

    // 3. Create User Profile for Admin
    console.log('📝 Creating user profiles...');
    await prisma.userProfile.upsert({
      where: { userId: adminUser.id },
      update: {},
      create: {
        userId: adminUser.id,
        phone: '+1-234-567-8900',
        location: 'San Francisco, CA',
        website: 'https://cvbuilder.com',
        bio: 'System Administrator',
        linkedin: 'https://linkedin.com/in/admin',
        defaultTemplate: 'MODERN',
        autoSaveEnabled: true,
        emailNotifications: true,
      },
    });

    await prisma.userProfile.upsert({
      where: { userId: testUser.id },
      update: {},
      create: {
        userId: testUser.id,
        defaultTemplate: 'CLASSIC',
        autoSaveEnabled: true,
        emailNotifications: false,
      },
    });
    console.log('✅ User profiles created\n');

    // 4. Configure AI Settings for Admin
    console.log('📝 Configuring AI settings...');
    await prisma.aISettings.upsert({
      where: { userId: adminUser.id },
      update: {
        openRouterKey: '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',
        openRouterModel: 'meta-llama/llama-3.2-3b-instruct:free',
        defaultProvider: 'OPENROUTER',
        aiSuggestionsEnabled: true,
        citationAssist: true,
        grammarCheck: true,
        autoImproveText: true,
      },
      create: {
        userId: adminUser.id,
        openRouterKey: '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',
        openRouterModel: 'meta-llama/llama-3.2-3b-instruct:free',
        defaultProvider: 'OPENROUTER',
        aiSuggestionsEnabled: true,
        citationAssist: true,
        grammarCheck: true,
        autoImproveText: true,
      },
    });
    console.log('✅ AI settings configured\n');

    // 5. Create Sample CV for Admin
    console.log('📝 Creating sample CV...');
    const sampleCV = await prisma.cV.create({
      data: {
        userId: adminUser.id,
        title: 'Sample Academic CV',
        template: 'MODERN',
        category: 'ACADEMIC',
        isPublic: false,
        fullName: 'Dr. John Smith',
        email: 'john.smith@university.edu',
        phone: '+1-555-0123',
        location: 'Boston, MA, USA',
        website: 'https://johnsmith.com',
        summary: 'Distinguished Professor of Computer Science with 15+ years of research experience in artificial intelligence and machine learning.',
      },
    });
    console.log('✅ Sample CV created\n');

    // 6. Add Education to Sample CV
    console.log('📝 Adding education records...');
    await prisma.education.createMany({
      data: [
        {
          cvId: sampleCV.id,
          institution: 'Massachusetts Institute of Technology',
          degree: 'Ph.D.',
          field: 'Computer Science',
          location: 'Cambridge, MA',
          startDate: new Date('2005-09-01'),
          endDate: new Date('2009-05-31'),
          current: false,
          gpa: '4.0',
          description: 'Dissertation: "Advanced Machine Learning Algorithms for Natural Language Processing"',
          order: 0,
        },
        {
          cvId: sampleCV.id,
          institution: 'Stanford University',
          degree: 'M.S.',
          field: 'Computer Science',
          location: 'Stanford, CA',
          startDate: new Date('2003-09-01'),
          endDate: new Date('2005-06-30'),
          current: false,
          gpa: '3.95',
          description: 'Specialized in Artificial Intelligence and Machine Learning',
          order: 1,
        },
      ],
    });
    console.log('✅ Education records added\n');

    // 7. Add Experience to Sample CV
    console.log('📝 Adding experience records...');
    await prisma.experience.createMany({
      data: [
        {
          cvId: sampleCV.id,
          company: 'Harvard University',
          position: 'Associate Professor',
          location: 'Cambridge, MA',
          startDate: new Date('2015-07-01'),
          current: true,
          description: 'Leading research in artificial intelligence and machine learning. Teaching graduate and undergraduate courses.',
          achievements: 'Published 50+ peer-reviewed papers\nSecured $5M in research grants\nAdvised 15 Ph.D. students',
          order: 0,
        },
        {
          cvId: sampleCV.id,
          company: 'MIT Media Lab',
          position: 'Assistant Professor',
          location: 'Cambridge, MA',
          startDate: new Date('2009-08-01'),
          endDate: new Date('2015-06-30'),
          current: false,
          description: 'Conducted cutting-edge research in AI and cognitive science.',
          achievements: 'Published 30+ papers in top-tier conferences\nReceived NSF CAREER Award\nDeveloped novel deep learning architectures',
          order: 1,
        },
      ],
    });
    console.log('✅ Experience records added\n');

    // 8. Add Publications to Sample CV
    console.log('📝 Adding publications...');
    await prisma.publication.createMany({
      data: [
        {
          cvId: sampleCV.id,
          type: 'JOURNAL',
          title: 'Deep Learning Approaches for Natural Language Understanding',
          authors: 'Smith, J., Johnson, A., Williams, B.',
          journal: 'Nature Machine Intelligence',
          year: 2024,
          volume: '6',
          issue: '3',
          pages: '245-260',
          doi: '10.1038/s42256-024-00123-4',
          citations: 127,
          impactFactor: 25.5,
          jcrZone: 'Q1',
          order: 0,
        },
        {
          cvId: sampleCV.id,
          type: 'CONFERENCE',
          title: 'Transformer-based Models for Code Generation',
          authors: 'Smith, J., Davis, C.',
          conference: 'NeurIPS 2023',
          year: 2023,
          pages: '1234-1245',
          citations: 89,
          order: 1,
        },
        {
          cvId: sampleCV.id,
          type: 'JOURNAL',
          title: 'Advances in Reinforcement Learning for Robotics',
          authors: 'Smith, J., Martinez, D., Lee, E.',
          journal: 'Science Robotics',
          year: 2023,
          volume: '8',
          issue: '2',
          pages: '100-115',
          doi: '10.1126/scirobotics.abc1234',
          citations: 156,
          impactFactor: 22.3,
          jcrZone: 'Q1',
          order: 2,
        },
      ],
    });
    console.log('✅ Publications added\n');

    // 9. Add Skills to Sample CV
    console.log('📝 Adding skills...');
    await prisma.skill.createMany({
      data: [
        { cvId: sampleCV.id, name: 'Machine Learning', category: 'Technical', level: 95, order: 0 },
        { cvId: sampleCV.id, name: 'Deep Learning', category: 'Technical', level: 95, order: 1 },
        { cvId: sampleCV.id, name: 'Python', category: 'Programming', level: 95, order: 2 },
        { cvId: sampleCV.id, name: 'PyTorch', category: 'Framework', level: 85, order: 3 },
        { cvId: sampleCV.id, name: 'TensorFlow', category: 'Framework', level: 85, order: 4 },
        { cvId: sampleCV.id, name: 'Research Design', category: 'Research', level: 95, order: 5 },
      ],
    });
    console.log('✅ Skills added\n');

    // 10. Add Awards to Sample CV
    console.log('📝 Adding awards...');
    await prisma.award.createMany({
      data: [
        {
          cvId: sampleCV.id,
          title: 'ACM Fellow',
          issuer: 'Association for Computing Machinery',
          date: new Date('2023-01-15'),
          description: 'For contributions to artificial intelligence and machine learning',
          order: 0,
        },
        {
          cvId: sampleCV.id,
          title: 'Best Paper Award',
          issuer: 'NeurIPS 2023',
          date: new Date('2023-12-10'),
          description: 'Outstanding paper on transformer-based code generation',
          order: 1,
        },
      ],
    });
    console.log('✅ Awards added\n');

    // 11. Add Languages to Sample CV
    console.log('📝 Adding languages...');
    await prisma.language.createMany({
      data: [
        { cvId: sampleCV.id, name: 'English', proficiency: 'NATIVE', order: 0 },
        { cvId: sampleCV.id, name: 'Spanish', proficiency: 'PROFESSIONAL', order: 1 },
        { cvId: sampleCV.id, name: 'French', proficiency: 'INTERMEDIATE', order: 2 },
      ],
    });
    console.log('✅ Languages added\n');

    // 12. Add Certifications
    console.log('📝 Adding certifications...');
    await prisma.certification.createMany({
      data: [
        {
          cvId: sampleCV.id,
          name: 'AWS Machine Learning Specialty',
          issuer: 'Amazon Web Services',
          issueDate: new Date('2023-06-15'),
          credentialId: 'AWS-ML-2023-001234',
          order: 0,
        },
      ],
    });
    console.log('✅ Certifications added\n');

    // 13. Add References
    console.log('📝 Adding references...');
    await prisma.reference.createMany({
      data: [
        {
          cvId: sampleCV.id,
          name: 'Prof. Sarah Johnson',
          position: 'Department Chair',
          organization: 'MIT Computer Science',
          email: 'sjohnson@mit.edu',
          phone: '+1-555-0199',
          relationship: 'Former Ph.D. Advisor',
          order: 0,
        },
      ],
    });
    console.log('✅ References added\n');

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Database setup completed successfully!\n');
    console.log('📋 Login Credentials:');
    console.log('───────────────────────────────────────────────────────');
    console.log('Admin Account:');
    console.log('  Email:    admin@cvbuilder.com');
    console.log('  Password: admin');
    console.log('');
    console.log('Test Account:');
    console.log('  Email:    test@cvbuilder.com');
    console.log('  Password: test123');
    console.log('───────────────────────────────────────────────────────');
    console.log('\n✨ You can now login at: http://localhost:3000');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
