import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Lock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import FeatureCard from './FeatureCard';

const Home = () => {
  return (
    <div className="relative">
      {/* Adjust for header height with top padding */}
      <div className="pt-[80px] relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="pt-[80px] mx-auto max-w-7xl px-4 sm:pt-[96px] sm:px-6 md:pt-[112px] lg:pt-[128px] lg:px-8 xl:pt-[144px]">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="sm:text-center lg:text-left"
              >
                <h1 className="text-4xl tracking-tight font-extrabold text-green sm:text-5xl md:text-6xl">
                  <span className="block">Simplifying</span>
                  <span className="block text-green-400">University Elections</span>
                </h1>
                <p className="mt-3 text-base sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Conduct seamless and transparent elections for your university or department. From voter registration to result announcements, eVoting makes the process simple and secure.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      to="/elections"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:py-4 md:text-lg md:px-10"
                    >
                      Explore Elections
                      <ArrowRight className="ml-2" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </main>

          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="../img/imag.png"
            alt="Voting"
          />
        </div>
      </div>

      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight sm:text-4xl">
              Your Voting Solution at a Glance
            </p>
          </div>

          <div className="mt-10 bg-green-200 p-8 rounded-md">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <FeatureCard
                  icon={<Users className="h-6 w-6" />}
                  title="Easy Registration"
                  description="Seamless voter and candidate registration for university and departmental elections."
                  className="text-black"
                />
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <FeatureCard
                  icon={<Lock className="h-6 w-6" />}
                  title="Secure and Transparent"
                  description="Ensure secure and fair voting with end-to-end encryption and real-time audits."
                  className="text-black"
                />
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <FeatureCard
                  icon={<CheckCircle className="h-6 w-6" />}
                  title="Instant Results"
                  description="View election results instantly with automated tallying and detailed analytics."
                  className="text-black"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
