import React, { useEffect } from 'react';
import { Card } from 'flowbite-react'; 
import { Link } from 'react-router'; 
import AOS from 'aos'; 
import "aos/dist/aos.css"; 

const LatestNews = () => {
  useEffect(() => {
    AOS.init({
      once: true,
      duration: 800,
      easing: 'ease-out',
    });
  }, []);

  const newsData = [
    {
      id: 1,
      image: "https://placehold.co/400x250/2563EB/FFFFFF?text=HR+Trends",
      title: "Top HR Trends to Watch in 2025",
      date: "July 5, 2025",
      excerpt: "Explore the latest trends shaping the human resources landscape and how WorkSphere helps you adapt.",
      link: "/blog/hr-trends-2025"
    },
    {
      id: 2,
      image: "https://placehold.co/400x250/6366F1/FFFFFF?text=Productivity",
      title: "Boosting Employee Productivity with Digital Tools",
      date: "June 28, 2025",
      excerpt: "Discover strategies and tools to enhance your team's productivity and efficiency.",
      link: "/blog/employee-productivity"
    },
    {
      id: 3,
      image: "https://placehold.co/400x250/84CC16/FFFFFF?text=Workplace+Culture",
      title: "Building a Positive Workplace Culture",
      date: "June 20, 2025",
      excerpt: "Learn how to foster a supportive and engaging environment for your employees.",
      link: "/blog/workplace-culture"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-gray-800 dark:via-gray-700 dark:to-gray-900">
  <div className="container mx-auto px-4">
    <h2 className="text-4xl font-extrabold text-center mb-12 text-white" data-aos="fade-up">
      Latest News & Insights
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {newsData.map((news, index) => (
        <Card
          key={news.id}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1"
          data-aos="fade-up"
          data-aos-delay={`${index * 150}`} 
        >
          <img src={news.image} alt={news.title} className="rounded-t-lg w-full h-48 object-cover mb-4" />
          <div className="p-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {news.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              {news.date}
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-base mb-4">
              {news.excerpt}
            </p>
            <Link to={news.link} className="inline-flex items-center text-white hover:text-lime-400 dark:hover:text-lime-400 font-semibold transition-colors">
              Read more
              <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
            </Link>
          </div>
        </Card>
      ))}
    </div>
  </div>
</section>
  );
};

export default LatestNews;
