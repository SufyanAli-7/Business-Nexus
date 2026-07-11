import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import connectDB from "../config/db.js";

// Make sure database is connected
connectDB();

const seedUsers = [
  // 10 Entrepreneurs
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@techwave.io',
    role: 'entrepreneur',
    avatarUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    bio: 'Serial entrepreneur with 10+ years of experience in SaaS and fintech. Passionate about AI solutions.',
    startupName: 'TechWave AI',
    pitchSummary: 'AI-powered financial analytics platform helping SMBs make data-driven decisions.',
    fundingNeeded: '$1.5M',
    industry: 'FinTech',
    location: 'San Francisco, CA',
    foundedYear: 2021,
    teamSize: 12,
    isOnline: true
  },
  {
    name: 'David Chen',
    email: 'david.chen@greenlife.co',
    role: 'entrepreneur',
    avatarUrl: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
    bio: 'Environmental scientist turned entrepreneur. Passionate about sustainable solutions.',
    startupName: 'GreenLife Solutions',
    pitchSummary: 'Biodegradable packaging alternatives for consumer goods and food industry.',
    fundingNeeded: '$2M',
    industry: 'CleanTech',
    location: 'Portland, OR',
    foundedYear: 2020,
    teamSize: 8,
    isOnline: false
  },
  {
    name: 'Maya Patel',
    email: 'maya.patel@healthpulse.com',
    role: 'entrepreneur',
    avatarUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    bio: 'Former healthcare professional with an MBA. Building tech to improve patient care.',
    startupName: 'HealthPulse',
    pitchSummary: 'Mobile platform connecting patients with mental health professionals in real-time.',
    fundingNeeded: '$800K',
    industry: 'HealthTech',
    location: 'Boston, MA',
    foundedYear: 2022,
    teamSize: 5,
    isOnline: true
  },
  {
    name: 'James Wilson',
    email: 'james.wilson@urbanfarm.io',
    role: 'entrepreneur',
    avatarUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    bio: 'Agricultural engineer focused on urban farming solutions and food security.',
    startupName: 'UrbanFarm',
    pitchSummary: 'IoT-enabled vertical farming systems for urban environments and food deserts.',
    fundingNeeded: '$3M',
    industry: 'AgTech',
    location: 'Chicago, IL',
    foundedYear: 2019,
    teamSize: 14,
    isOnline: false
  },
  {
    name: 'Liam Smith',
    email: 'liam.smith@blockledger.io',
    role: 'entrepreneur',
    avatarUrl: 'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg',
    bio: 'Blockchain developer and cryptography enthusiast aiming to democratize accounting.',
    startupName: 'BlockLedger',
    pitchSummary: 'Decentralized accounting software for modern remote-first businesses.',
    fundingNeeded: '$1.2M',
    industry: 'Blockchain',
    location: 'Austin, TX',
    foundedYear: 2023,
    teamSize: 7,
    isOnline: true
  },
  {
    name: 'Olivia Taylor',
    email: 'olivia.taylor@eduverse.com',
    role: 'entrepreneur',
    avatarUrl: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg',
    bio: 'EdTech innovator, former high school principal. Believes in immersive learning.',
    startupName: 'EduVerse',
    pitchSummary: 'Virtual reality classrooms providing immersive science education for K-12.',
    fundingNeeded: '$900K',
    industry: 'EdTech',
    location: 'Seattle, WA',
    foundedYear: 2022,
    teamSize: 9,
    isOnline: false
  },
  {
    name: 'Noah Garcia',
    email: 'noah.garcia@smartride.com',
    role: 'entrepreneur',
    avatarUrl: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg',
    bio: 'Automotive engineer working on next-gen electric scooter fleet optimization.',
    startupName: 'SmartRide',
    pitchSummary: 'AI-driven route planning and power management software for electric micromobility.',
    fundingNeeded: '$2.5M',
    industry: 'Mobility',
    location: 'Denver, CO',
    foundedYear: 2021,
    teamSize: 11,
    isOnline: true
  },
  {
    name: 'Emma Martinez',
    email: 'emma.martinez@foodflow.co',
    role: 'entrepreneur',
    avatarUrl: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg',
    bio: 'Supply chain expert designing algorithms for hyper-local food delivery networks.',
    startupName: 'FoodFlow',
    pitchSummary: 'B2B logistics platform optimizing raw ingredient distribution to local restaurants.',
    fundingNeeded: '$1.8M',
    industry: 'Logistics',
    location: 'Miami, FL',
    foundedYear: 2020,
    teamSize: 15,
    isOnline: false
  },
  {
    name: 'Lucas Robinson',
    email: 'lucas.robinson@cyberdefense.io',
    role: 'entrepreneur',
    avatarUrl: 'https://images.pexels.com/photos/1402828/pexels-photo-1402828.jpeg',
    bio: 'Former cybersecurity analyst at NSA, building endpoint security software for startups.',
    startupName: 'CyberDefense',
    pitchSummary: 'One-click automated threat detection and compliance auditing tool for startups.',
    fundingNeeded: '$1.1M',
    industry: 'Cybersecurity',
    location: 'Washington, DC',
    foundedYear: 2023,
    teamSize: 6,
    isOnline: true
  },
  {
    name: 'Sophia Davis',
    email: 'sophia.davis@retailpulse.com',
    role: 'entrepreneur',
    avatarUrl: 'https://images.pexels.com/photos/1845534/pexels-photo-1845534.jpeg',
    bio: 'Retail strategist leveraging computer vision to analyze brick-and-mortar foot traffic.',
    startupName: 'RetailPulse',
    pitchSummary: 'Camera-based visual analytics tool optimizing store layouts and checkout efficiency.',
    fundingNeeded: '$1.4M',
    industry: 'E-commerce',
    location: 'New York, NY',
    foundedYear: 2021,
    teamSize: 10,
    isOnline: true
  },

  // 10 Investors
  {
    name: 'Michael Rodriguez',
    email: 'michael.r@vcinnovate.com',
    role: 'investor',
    avatarUrl: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    bio: 'Early-stage investor with focus on B2B SaaS and fintech. Previously founded and exited two startups.',
    investmentInterests: ['FinTech', 'SaaS', 'AI/ML'],
    investmentStage: ['Seed', 'Series A'],
    portfolioCompanies: ['PayStream', 'DataSense', 'CloudSecure'],
    totalInvestments: 12,
    minimumInvestment: '$250K',
    maximumInvestment: '$1.5M',
    isOnline: true
  },
  {
    name: 'Jennifer Lee',
    email: 'jennifer.l@impactvc.org',
    role: 'investor',
    avatarUrl: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    bio: 'Impact investor focused on climate tech, sustainable agriculture, and clean energy.',
    investmentInterests: ['CleanTech', 'AgTech', 'Sustainability'],
    investmentStage: ['Seed', 'Series A', 'Series B'],
    portfolioCompanies: ['SolarFlow', 'EcoPackage', 'CleanWater Solutions'],
    totalInvestments: 18,
    minimumInvestment: '$500K',
    maximumInvestment: '$3M',
    isOnline: false
  },
  {
    name: 'Robert Torres',
    email: 'robert.t@healthventures.com',
    role: 'investor',
    avatarUrl: 'https://images.pexels.com/photos/834863/pexels-photo-834863.jpeg',
    bio: 'Healthcare-focused investor with medical background. Looking for innovations in patient care and biotech.',
    investmentInterests: ['HealthTech', 'BioTech', 'Medical Devices'],
    investmentStage: ['Series A', 'Series B'],
    portfolioCompanies: ['MediTrack', 'BioGenics', 'Patient+'],
    totalInvestments: 9,
    minimumInvestment: '$1M',
    maximumInvestment: '$5M',
    isOnline: true
  },
  {
    name: 'Amanda Carter',
    email: 'amanda.c@firstround.co',
    role: 'investor',
    avatarUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
    bio: 'Angel investor and ex-VP of Product at Stripe. Interested in infrastructure, payments, and dev tools.',
    investmentInterests: ['FinTech', 'SaaS', 'Infrastructure'],
    investmentStage: ['Pre-Seed', 'Seed'],
    portfolioCompanies: ['PayGate', 'APIHub', 'LogFlow'],
    totalInvestments: 15,
    minimumInvestment: '$50K',
    maximumInvestment: '$250K',
    isOnline: true
  },
  {
    name: 'William Gibson',
    email: 'william.g@alphafund.com',
    role: 'investor',
    avatarUrl: 'https://images.pexels.com/photos/912278/pexels-photo-912278.jpeg',
    bio: 'Partner at Alpha Fund with 15+ years experience. Focussing on enterprise tech and high-performance computing.',
    investmentInterests: ['Enterprise', 'Cloud', 'SaaS'],
    investmentStage: ['Series A', 'Series B', 'Series C'],
    portfolioCompanies: ['CloudStack', 'Securify', 'NetOptima'],
    totalInvestments: 22,
    minimumInvestment: '$500K',
    maximumInvestment: '$5M',
    isOnline: false
  },
  {
    name: 'Elizabeth Bennett',
    email: 'elizabeth.b@bluehorizon.vc',
    role: 'investor',
    avatarUrl: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
    bio: 'DeepTech and space systems enthusiast. Investing in quantum computing, aerospace, and robotics.',
    investmentInterests: ['DeepTech', 'SpaceTech', 'Robotics'],
    investmentStage: ['Seed', 'Series A'],
    portfolioCompanies: ['OrbitX', 'QuantumQubit', 'RoboMech'],
    totalInvestments: 7,
    minimumInvestment: '$200K',
    maximumInvestment: '$2M',
    isOnline: true
  },
  {
    name: 'Daniel Kim',
    email: 'daniel.k@capitalgrowth.com',
    role: 'investor',
    avatarUrl: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg',
    bio: 'Growth stage investor focusing on consumer internet, marketplace, and social commerce apps.',
    investmentInterests: ['E-commerce', 'Marketplace', 'Consumer Tech'],
    investmentStage: ['Series B', 'Series C', 'Growth'],
    portfolioCompanies: ['StyleCart', 'SwapNGo', 'ShareAll'],
    totalInvestments: 25,
    minimumInvestment: '$2M',
    maximumInvestment: '$10M',
    isOnline: false
  },
  {
    name: 'Jessica Miller',
    email: 'jessica.m@pioneervc.com',
    role: 'investor',
    avatarUrl: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg',
    bio: 'Empowering diverse founders in wellness, beauty tech, and sustainable consumer brands.',
    investmentInterests: ['Consumer Goods', 'Wellness', 'Sustainability'],
    investmentStage: ['Seed', 'Series A'],
    portfolioCompanies: ['PureSkin', 'FitMind', 'EcoThread'],
    totalInvestments: 14,
    minimumInvestment: '$100K',
    maximumInvestment: '$1M',
    isOnline: true
  },
  {
    name: 'Charles Harris',
    email: 'charles.h@nexusangels.com',
    role: 'investor',
    avatarUrl: 'https://images.pexels.com/photos/846741/pexels-photo-846741.jpeg',
    bio: 'Active angel investor in the Midwest. Mentoring early stage tech startups.',
    investmentInterests: ['SaaS', 'EdTech', 'AgTech'],
    investmentStage: ['Pre-Seed', 'Seed'],
    portfolioCompanies: ['ClassRoom+', 'CropYield', 'DraftSheet'],
    totalInvestments: 31,
    minimumInvestment: '$25K',
    maximumInvestment: '$150K',
    isOnline: true
  },
  {
    name: 'Emily Stone',
    email: 'emily.s@horizonventures.com',
    role: 'investor',
    avatarUrl: 'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg',
    bio: 'Venture partner at Horizon. Focusing on developer tools, API economy, and open source companies.',
    investmentInterests: ['DevTools', 'SaaS', 'API'],
    investmentStage: ['Seed', 'Series A'],
    portfolioCompanies: ['CodeForge', 'ApiGate', 'GitStream'],
    totalInvestments: 11,
    minimumInvestment: '$150K',
    maximumInvestment: '$1.2M',
    isOnline: false
  }
];

const seedDatabase = async () => {
  try {
    // Wait for connection to be ready
    await new Promise((resolve) => {
      if (mongoose.connection.readyState === 1) {
        resolve();
      } else {
        mongoose.connection.once("connected", resolve);
      }
    });

    console.log("Hashing default passwords and seeding users...");
    const defaultPasswordHash = await bcrypt.hash("password123", 10);

    let insertedCount = 0;
    let skippedCount = 0;

    for (const u of seedUsers) {
      const existingUser = await User.findOne({ email: u.email.toLowerCase() });

      if (existingUser) {
        console.log(`[SKIPPED] User with email ${u.email} already exists.`);
        skippedCount++;
      } else {
        const newUser = new User({
          ...u,
          password: defaultPasswordHash
        });
        await newUser.save();
        console.log(`[CREATED] User ${u.name} (${u.role}) created.`);
        insertedCount++;
      }
    }

    console.log(`\nSeeding completed successfully!`);
    console.log(`Created: ${insertedCount} users.`);
    console.log(`Skipped (already exist): ${skippedCount} users.`);
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
  }
};

seedDatabase();
