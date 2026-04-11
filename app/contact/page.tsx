"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setError(data.error || "Failed to submit feedback");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4">
          📧 Contact Us
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Have questions, suggestions, or found a bug? We'd love to hear from
          you!
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <Card title="Send us a Message">
          {success ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Thank You!
              </h3>
              <p className="text-gray-600 mb-6">
                Your message has been submitted successfully. I will get back to you soon.
              </p>
              <Button onClick={() => setSuccess(false)}>
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Your Name *"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
                <Input
                  label="Email *"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <Input
                label="Subject *"
                placeholder="What is this about?"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Message *
                </label>
                <textarea
                  rows={5}
                  placeholder="Describe your question, suggestion, or issue..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <Button type="submit" isLoading={loading} className="w-full">
                Send Message
              </Button>
            </form>
          )}
        </Card>

        {/* Contact Info */}
        <div className="space-y-6">
          <Card title="System Developer">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                EN
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  Emamul Islam Nadid
                </h4>
                <p className="text-gray-600 text-sm">Developer & Maintainer</p>
                <a
                  href="https://github.com/einadid"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 mt-1"
                >
                  <span>GitHub</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          </Card>
          <Card title="Contact Information">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📧</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                <a
                  href="mailto:emamulislamnadid_cse30d@portcity.edu.bd"
                  className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  emamulislamnadid_cse30d@portcity.edu.bd
                </a>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
