"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export function ProfileForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* Avatar Representation Placeholder */}
      <div className="flex items-center gap-4 pb-2">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center border border-border/80 text-muted-foreground">
          <User className="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-foreground">Avatar Representation</h3>
          <p className="text-xs text-muted-foreground">Avatar upload feature coming soon.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="firstName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            placeholder="John"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border/80 rounded-md text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="lastName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border/80 rounded-md text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          placeholder="student@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 bg-background border border-border/80 rounded-md text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="bio" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Bio / Short Headline
        </label>
        <textarea
          id="bio"
          rows={3}
          placeholder="Tell us a little bit about yourself..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full px-3 py-2 bg-background border border-border/80 rounded-md text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
        />
      </div>

      <Button type="submit" className="h-9 font-medium">
        Save Changes
      </Button>
    </form>
  );
}
