"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

// Define types for the component props
interface HeroPillProps {
  text: string;
  href?: string;
}

interface HeroActionProps {
  text: string;
  href: string;
  icon?: ReactNode;
}

interface HeroContentProps {
  title: string;
  titleHighlight?: string;
  description: string;
  primaryAction?: HeroActionProps;
  secondaryAction?: HeroActionProps;
}

interface HeroProps {
  pill?: HeroPillProps;
  content: HeroContentProps;
  preview?: ReactNode;
  className?: string;
}

export const Hero = ({
  pill,
  content,
  preview,
  className,
}: HeroProps) => {
  // Animation constants
  const ease = [0.16, 1, 0.3, 1]; // Custom ease for animations
  const duration = 0.5;

  return (
    <section className={cn("py-12 md:py-24 lg:py-32", className)}>
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_550px]">
          <div className="flex flex-col justify-center space-y-4">
            {pill && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration, ease, delay: 0.1 }}
              >
                <div className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium shadow-sm dark:border-gray-800 dark:bg-gray-950">
                  {pill.href ? (
                    <a
                      href={pill.href}
                      className="inline-flex items-center gap-x-1.5 text-sm font-medium leading-none"
                    >
                      {pill.text}
                    </a>
                  ) : (
                    <span className="text-sm font-medium leading-none">
                      {pill.text}
                    </span>
                  )}
                </div>
              </motion.div>
            )}

            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration, ease, delay: 0.2 }}
                className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
              >
                {content.title}{" "}
                {content.titleHighlight && (
                  <span className="text-primary">{content.titleHighlight}</span>
                )}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration, ease, delay: 0.3 }}
                className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400"
              >
                {content.description}
              </motion.p>
            </div>

            {(content.primaryAction || content.secondaryAction) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration, ease, delay: 0.4 }}
                className="flex flex-col gap-2 min-[400px]:flex-row"
              >
                {content.primaryAction && (
                  <a
                    href={content.primaryAction.href}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    {content.primaryAction.text}
                    {content.primaryAction.icon && (
                      <span className="ml-2">{content.primaryAction.icon}</span>
                    )}
                  </a>
                )}
                {content.secondaryAction && (
                  <a
                    href={content.secondaryAction.href}
                    className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    {content.secondaryAction.text}
                    {content.secondaryAction.icon && (
                      <span className="ml-2">
                        {content.secondaryAction.icon}
                      </span>
                    )}
                  </a>
                )}
              </motion.div>
            )}
          </div>

          {preview && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration, ease, delay: 0.5 }}
              className="flex items-center justify-center"
            >
              {preview}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
