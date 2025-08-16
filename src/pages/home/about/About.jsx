import { Link } from "react-router";


export default function About() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 text-center">
        <h1 className="text-5xl font-bold mb-4">About WorkSphere</h1>
        <p className="text-lg max-w-2xl mx-auto">
          Building modern digital solutions to make your work and life easier.
        </p>
      </section>

      {/* Our Story */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">Our Story</h2>
        <p className="text-gray-700 leading-relaxed text-lg">
          WorkSphere started with a simple idea: to create a platform that empowers 
          people to manage their tasks and workflows more effectively. From a small 
          team of passionate developers, we have grown into a full-fledged company 
          delivering solutions to hundreds of users worldwide.
        </p>
      </section>

      {/* Mission & Vision */}
      <section className="bg-gray-100 py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 shadow rounded-xl bg-white">
            <h3 className="text-2xl font-semibold mb-4">Our Mission</h3>
            <p>
              To simplify workflows and provide user-friendly solutions that improve 
              productivity for individuals and organizations worldwide.
            </p>
          </div>
          <div className="p-6 shadow rounded-xl bg-white">
            <h3 className="text-2xl font-semibold mb-4">Our Vision</h3>
            <p>
              To become a global leader in workplace solutions by delivering innovation, 
              collaboration, and excellence.
            </p>
          </div>
        </div>
      </section>

      {/* Team Members */}
      {/* <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-10 text-center">Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {["Rasel", "Sadia", "Tanvir"].map((name, index) => (
            <Card key={index} className="shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-6 text-center">
                <img
                  src={`https://i.pravatar.cc/150?img=${index + 10}`}
                  alt={name}
                  className="mx-auto rounded-full w-24 h-24 mb-4"
                />
                <h4 className="text-xl font-semibold">{name}</h4>
                <p className="text-gray-600">Front-End Developer</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section> */}

      {/* Statistics */}
      <section className="bg-indigo-700 text-white py-16">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <h3 className="text-4xl font-bold">500+</h3>
            <p>Projects</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold">200+</h3>
            <p>Clients</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold">50+</h3>
            <p>Team Members</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold">5 Years</h3>
            <p>Experience</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {/* <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-10 text-center">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6 shadow-xl">
            <p className="text-gray-700 italic">
              "WorkSphere has completely transformed the way I manage my tasks. Highly recommended!"
            </p>
            <h4 className="mt-4 font-semibold">- Abdullah</h4>
          </Card>
          <Card className="p-6 shadow-xl">
            <p className="text-gray-700 italic">
              "A modern solution for modern problems. Very easy to use and effective."
            </p>
            <h4 className="mt-4 font-semibold">- Ayesha</h4>
          </Card>
        </div>
      </section> */}

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to join our journey?</h2>
        <Link to='/contact' className="bg-white text-indigo-600 hover:bg-gray-200 font-semibold px-6 py-3 rounded-2xl">
          Contact Us
        </Link>
      </section>
    </div>
  );
}
