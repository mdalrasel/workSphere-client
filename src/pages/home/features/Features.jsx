import React, { useEffect } from 'react';
import { Link } from 'react-router';
import { Card } from 'flowbite-react';
import { FaUsers, FaDollarSign, FaFileContract, FaChartLine, FaShieldAlt, FaCogs, FaCloudUploadAlt, FaMobileAlt, FaHandshake, FaCheckCircle, FaTasks } from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import AOS from 'aos';
import "aos/dist/aos.css";

const Features = () => {
  useEffect(() => {
    AOS.init({
      once: true,
      duration: 800,
      easing: 'ease-out',
    });
  }, []);

  const coreFeatures = [
    {
      id: 1,
      icon: <FaUsers size={35} className="text-primary dark:text-blue-400 mb-4" />,
      title: "Employee Management",
      description: "Effortlessly manage employee profiles, personal details, and work history in one centralized system."
    },
    {
      id: 2,
      icon: <FaDollarSign size={35} className="text-accent dark:text-lime-400 mb-4" />,
      title: "Automated Payroll",
      description: "Streamline your payroll process with automated calculations, tax deductions, and timely salary disbursements."
    },
    {
      id: 3,
      icon: <FaFileContract size={35} className="text-secondary dark:text-indigo-400 mb-4" />,
      title: "Contract Tracking",
      description: "Keep track of all employee contracts, their terms, and expiration dates with automated reminders."
    },
    {
      id: 4,
      icon: <FaChartLine size={35} className="text-primary dark:text-blue-400 mb-4" />,
      title: "Performance Analytics",
      description: "Monitor employee performance with insightful analytics and reports to identify strengths and areas for improvement."
    },
    {
      id: 5,
      icon: <FaTasks size={35} className="text-accent dark:text-lime-400 mb-4" />,
      title: "Workflow Monitoring",
      description: "Gain real-time visibility into ongoing tasks and projects, ensuring efficient workflow and task completion."
    },
    {
      id: 6,
      icon: <FaHandshake size={35} className="text-secondary dark:text-indigo-400 mb-4" />,
      title: "HR Support & Ticketing",
      description: "Provide seamless HR support with an integrated ticketing system for employee queries and requests."
    },
  ];

  const securityFeatures = [
    {
      id: 1,
      icon: <FaShieldAlt size={30} className="text-primary dark:text-blue-400 mb-3" />,
      title: "Robust Data Encryption",
      description: "Your sensitive data is protected with industry-leading encryption standards, ensuring confidentiality."
    },
    {
      id: 2,
      icon: <FaCogs size={30} className="text-accent dark:text-lime-400 mb-3" />,
      title: "Access Control & Permissions",
      description: "Granular access control allows you to define who sees what, maintaining data integrity and privacy."
    },
    {
      id: 3,
      icon: <FaCloudUploadAlt size={30} className="text-secondary dark:text-indigo-400 mb-3" />,
      title: "Secure Cloud Storage",
      description: "All data is securely stored on cloud servers with regular backups and disaster recovery protocols."
    },
    {
      id: 4,
      icon: <FaMobileAlt size={30} className="text-primary dark:text-blue-400 mb-3" />,
      title: "Regular Security Audits",
      description: "We conduct frequent security audits and updates to protect against emerging threats."
    },
  ];

  const analyticsData = [
    { name: 'Jan', 'Task Completion': 70, 'Avg Score': 75 },
    { name: 'Feb', 'Task Completion': 75, 'Avg Score': 80 },
    { name: 'Mar', 'Task Completion': 80, 'Avg Score': 82 },
    { name: 'Apr', 'Task Completion': 85, 'Avg Score': 88 },
    { name: 'May', 'Task Completion': 90, 'Avg Score': 92 },
    { name: 'Jun', 'Task Completion': 88, 'Avg Score': 90 },
  ];

  const integrationData = [
    { name: 'Accounting', Usage: 120 },
    { name: 'Communication', Usage: 98 },
    { name: 'Project Mgmt', Usage: 70 },
    { name: 'HRIS', Usage: 50 },
  ];

  const colors = {
    primary: '#2563EB',
    secondary: '#6366F1',
    accent: '#84CC16',
    neutralBgCardLight: '#F3F4F6',
    neutralBorderLight: '#E5E7EB',
    neutralTextPrimaryLight: '#1F2937',
    neutralTextSecondaryLight: '#4B5563',
    neutralBgSectionDark: '#1F2937', // gray-800 for dark section background
    neutralBorderDark: '#374151', // gray-700 for dark border
    neutralTextPrimaryDark: '#F9FAFB', // gray-50 for dark text
  };

  return (
    <div className="bg-neutral-bg-light dark:bg-neutral-bg-dark text-neutral-text-primary-light dark:text-neutral-text-primary-dark">
      {/* Features Hero/Banner */}
      <section className="relative py-20 md:py-24 bg-primary dark:bg-neutral-bg-section-dark text-neutral-text-primary-dark text-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://placehold.co/1920x400/2563EB/FFFFFF?text=WorkSphere+Features')" }}
          aria-hidden="true"></div>
        <div className="absolute inset-0 bg-primary opacity-80 dark:bg-neutral-bg-dark dark:opacity-90"></div>
        <div className="container mx-auto px-4 relative z-10" data-aos="fade-up">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
            Powerful Features for Modern HR
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90">
            WorkSphere offers a comprehensive suite of tools designed to streamline your HR processes and empower your workforce.
          </p>
        </div>
      </section>

      {/* Core Features Overview (Grid of Cards) */}
      <section className="py-16 md:py-24 bg-neutral-bg-section-light dark:bg-neutral-bg-dark">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-center mb-12 text-neutral-text-primary-light dark:text-neutral-text-primary-dark" data-aos="fade-up">
            Key Features at a Glance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => (
              <Card
                key={feature.id}
                className="flex flex-col items-center text-center p-6 bg-neutral-bg-card-light dark:bg-neutral-bg-section-dark border border-neutral-border-light dark:border-neutral-border-dark shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1"
                data-aos="fade-up"
                data-aos-delay={`${index * 100}`}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-neutral-text-primary-light dark:text-neutral-text-primary-dark mb-2">
                  {feature.title}
                </h3>
                <p className="text-neutral-text-secondary-light dark:text-neutral-text-secondary-dark text-sm">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Analytics & Reporting */}
      <section className="py-16 md:py-24 bg-neutral-bg-light dark:bg-neutral-bg-section-dark">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2" data-aos="fade-right">
            <h2 className="text-4xl font-extrabold mb-6 text-neutral-text-primary-light dark:text-neutral-text-primary-dark">
              Insightful Analytics & Reporting
            </h2>
            <p className="text-lg text-neutral-text-secondary-light dark:text-neutral-text-secondary-dark mb-6">
              Make data-driven decisions with WorkSphere's powerful analytics dashboard. Track key HR metrics, employee performance, and payroll trends with customizable reports.
            </p>
            <ul className="space-y-3 text-neutral-text-secondary-light dark:text-neutral-text-secondary-dark">
              <li className="flex items-center">
                <FaCheckCircle className="text-accent dark:text-lime-400 mr-2" /> Real-time performance dashboards
              </li>
              <li className="flex items-center">
                <FaCheckCircle className="text-accent dark:text-lime-400 mr-2" /> Customizable report generation
              </li>
              <li className="flex items-center">
                <FaCheckCircle className="text-accent dark:text-lime-400 mr-2" /> Trend analysis for workforce planning
              </li>
            </ul>
            <Link
              to="/dashboard" 
              className="mt-8 inline-flex items-center bg-primary text-neutral-text-primary-dark px-6 py-3 rounded-md font-bold hover:bg-blue-700 transition-colors shadow-md
                         dark:bg-blue-400 dark:text-neutral-text-primary-light dark:hover:bg-blue-500"
              data-aos="fade-up" data-aos-delay="500"
            >
              View Dashboard Demo
              <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
            </Link>
          </div>
          <div className="lg:w-1/2 w-full h-80 lg:h-96 bg-neutral-bg-card-light dark:bg-neutral-bg-section-dark rounded-lg shadow-xl border border-neutral-border-light dark:border-neutral-border-dark p-4" data-aos="fade-left" data-aos-delay="200">
            <h3 className="text-lg font-semibold mb-4 text-neutral-text-primary-light dark:text-neutral-text-primary-dark text-center">Monthly Performance Overview</h3>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart
                data={analyticsData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={getComputedStyle(document.documentElement).getPropertyValue('--color-neutral-border-light').trim()} />
                <XAxis dataKey="name" stroke={getComputedStyle(document.documentElement).getPropertyValue('--color-neutral-text-secondary-light').trim()} />
                <YAxis stroke={getComputedStyle(document.documentElement).getPropertyValue('--color-neutral-text-secondary-light').trim()} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--color-neutral-bg-card-light').trim(),
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--color-neutral-border-light').trim(),
                    color: getComputedStyle(document.documentElement).getPropertyValue('--color-neutral-text-primary-light').trim()
                  }}
                  itemStyle={{ color: getComputedStyle(document.documentElement).getPropertyValue('--color-neutral-text-primary-light').trim() }}
                />
                <Legend wrapperStyle={{ color: getComputedStyle(document.documentElement).getPropertyValue('--color-neutral-text-primary-light').trim() }} />
                
                <Bar dataKey="Task Completion" fill={colors.primary} />
                <Bar dataKey="Avg Score" fill={colors.accent} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="py-16 md:py-24 bg-neutral-bg-section-light dark:bg-neutral-bg-dark">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-center mb-12 text-neutral-text-primary-light dark:text-neutral-text-primary-dark" data-aos="fade-up">
            Your Data, Secured
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {securityFeatures.map((feature, index) => (
              <Card
                key={feature.id}
                className="flex flex-col items-center text-center p-6 bg-neutral-bg-card-light dark:bg-neutral-bg-section-dark border border-neutral-border-light dark:border-neutral-border-dark shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1"
                data-aos="fade-up"
                data-aos-delay={`${index * 100}`}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-neutral-text-primary-light dark:text-neutral-text-primary-dark mb-2">
                  {feature.title}
                </h3>
                <p className="text-neutral-text-secondary-light dark:text-neutral-text-secondary-dark text-sm">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Capabilities */}
      <section className="py-16 md:py-24 bg-neutral-bg-light dark:bg-neutral-bg-section-dark">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">
     
          <div className="lg:w-1/2 w-full h-80 lg:h-96 bg-neutral-bg-card-light dark:bg-neutral-bg-section-dark rounded-lg shadow-xl border border-neutral-border-light dark:border-neutral-border-dark p-4" data-aos="fade-right">
            <h3 className="text-lg font-semibold mb-4 text-neutral-text-primary-light dark:text-neutral-text-primary-dark text-center">Integration Usage by Platform</h3>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart
                data={integrationData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={getComputedStyle(document.documentElement).getPropertyValue('--color-neutral-border-light').trim()} />
                <XAxis dataKey="name" stroke={getComputedStyle(document.documentElement).getPropertyValue('--color-neutral-text-secondary-light').trim()} />
                <YAxis stroke={getComputedStyle(document.documentElement).getPropertyValue('--color-neutral-text-secondary-light').trim()} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--color-neutral-bg-card-light').trim(),
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--color-neutral-border-light').trim(),
                    color: getComputedStyle(document.documentElement).getPropertyValue('--color-neutral-text-primary-light').trim()
                  }}
                  itemStyle={{ color: getComputedStyle(document.documentElement).getPropertyValue('--color-neutral-text-primary-light').trim() }}
                />
                <Legend wrapperStyle={{ color: getComputedStyle(document.documentElement).getPropertyValue('--color-neutral-text-primary-light').trim() }} />
              
                <Bar dataKey="Usage" fill={colors.secondary} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="lg:w-1/2" data-aos="fade-left" data-aos-delay="200">
            <h2 className="text-4xl font-extrabold mb-6 text-neutral-text-primary-light dark:text-neutral-text-primary-dark">
              Seamless Integration with Your Ecosystem
            </h2>
            <p className="text-lg text-neutral-text-secondary-light dark:text-neutral-text-secondary-dark mb-6">
              WorkSphere is designed to fit perfectly into your existing tech stack. Integrate with popular tools for accounting, communication, and more to create a unified workflow.
            </p>
            <ul className="space-y-3 text-neutral-text-secondary-light dark:text-neutral-text-secondary-dark">
              <li className="flex items-center">
                <FaCheckCircle className="text-accent dark:text-lime-400 mr-2" /> API access for custom connections
              </li>
              <li className="flex items-center">
                <FaCheckCircle className="text-accent dark:text-lime-400 mr-2" /> Sync with accounting software
              </li>
              <li className="flex items-center">
                <FaCheckCircle className="text-accent dark:text-lime-400 mr-2" /> Communication platform integrations
              </li>
            </ul>
            <Link
              to="/dashbord" 
              className="mt-8 inline-flex items-center bg-accent text-neutral-text-primary-light px-6 py-3 rounded-md font-bold hover:bg-lime-600 transition-colors shadow-md
                         dark:bg-accent-dark dark:text-neutral-text-primary-light dark:hover:bg-lime-500"
              data-aos="fade-up" data-aos-delay="500"
            >
              Learn About Integrations
              <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};



export default Features;
