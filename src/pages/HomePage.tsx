import { Link } from 'react-router'
import { projects, visibleProjects } from '../content/projects'
import { site } from '../content/site'
import { skillCategories } from '../content/skills'
import { timeline } from '../content/timeline'
import { Section } from '../components/layout/Section'
import { HeroProjects } from '../components/home/HeroProjects'
import { AccordionGallery } from '../components/home/AccordionGallery'
import { ProfileCard } from '../components/home/ProfileCard'
import { SkillsConstellation } from '../components/home/SkillsConstellation'
import { JourneyTimeline } from '../components/home/JourneyTimeline'
import { SectionStack } from '../components/home/SectionStack'
import '../components/home/home.css'

export function HomePage() {
  const visible = visibleProjects(projects, site.includeDrafts)
  const featured = visible.filter((project) => project.featured)
  return (
    <SectionStack>
      <section
        id="home"
        className="hero-section page-width"
        tabIndex={-1}
        aria-labelledby="hero-name"
      >
        <div className="hero-copy">
          <p className="eyebrow">Software Engineering Student</p>
          <h1 id="hero-name" tabIndex={-1}>
            <span className="hero-wordmark">
              Darsh Patel<span className="hero-period">.</span>
            </span>
          </h1>
          <p className="hero-headline">{site.headline}</p>
          <p className="hero-description">{site.description}</p>
          <div className="hero-actions flex flex-wrap items-center gap-3">
            <Link to="/#projects" className="action-link">
              View Projects <span aria-hidden="true">↗</span>
            </Link>
            <span className="pending-action">
              Resume <span className="pending-label">PDF pending</span>
            </span>
          </div>
        </div>
        <HeroProjects
          projects={featured.filter((project) => project.heroOrbit)}
        />
        <div className="hero-bottom">
          <span className="mono">Ideas. Systems. Thoughtful details.</span>
          <a href="#projects" className="text-link">
            Explore the work <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>
      <Section
        id="projects"
        number="01"
        label="Selected projects"
        title="A closer look at the work."
      >
        <p className="section-intro">
          Five featured projects, with room to explore how they were built. Case
          studies and original media are being prepared.
        </p>
        {featured.length ? (
          <AccordionGallery projects={featured} />
        ) : (
          <p className="content-note">
            Projects will appear here after their content is reviewed.
          </p>
        )}
        <div className="more-projects">
          <h3 className="small-heading">More Projects</h3>
          <div className="supporting-grid grid gap-4 md:grid-cols-2">
            {visible
              .filter((project) => !project.featured)
              .map((project) => (
                <Link
                  className="supporting-project"
                  to={`/projects/${project.slug}`}
                  key={project.id}
                >
                  <span>
                    <span className="mono quiet">
                      {String(project.order).padStart(2, '0')}
                    </span>
                    <strong>{project.title}</strong>
                    <small>Draft case study · content pending</small>
                  </span>
                  <span aria-hidden="true">↗</span>
                </Link>
              ))}
          </div>
        </div>
      </Section>
      <Section
        id="about"
        number="02"
        label="About me"
        title="A little about the person."
      >
        <div className="about-layout grid gap-12 lg:grid-cols-2">
          <div className="prose">
            <p className="lead-copy">{site.description}</p>
            <p className="content-note">
              A more personal biography will be added after review. Program
              details, dates, and experience will come from a verified resume.
            </p>
            <Link to="/#contact" className="text-link">
              Contact Me <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <ProfileCard />
        </div>
      </Section>
      <Section
        id="skills"
        number="03"
        label="Technical skills"
        title="The tools behind the work."
      >
        <p className="section-intro">
          A categorized foundation for the skills list. Technologies will be
          added once confirmed against actual project work.
        </p>
        <SkillsConstellation categories={skillCategories} />
      </Section>
      <Section
        id="experience"
        number="04"
        label="Experience & education"
        title="My Journey."
      >
        <p className="section-intro">
          Learning, building, and the experiences along the way.
        </p>
        <JourneyTimeline entries={timeline} />
      </Section>
      <Section
        id="contact"
        number="05"
        label="Get in touch"
        title="Let’s start a conversation."
        className="contact-section"
      >
        <div className="contact-foundation">
          <div className="correspondence-heading">
            <span className="eyebrow">Correspondence / 01</span>
            <span className="mono quiet">Darsh Patel</span>
          </div>
          <p className="letter-greeting">Dear Darsh,</p>
          <p className="contact-copy">
            Have an opportunity, an idea to build together, or simply something
            to say?
          </p>
          <div className="letter-rule" />
          <p className="content-note">
            Contact details are pending verification. You’ll be able to send a
            letter from here once message delivery is available.
          </p>
          <p className="letter-closing">
            Sincerely,
            <br />
            <span className="quiet">A future conversation.</span>
          </p>
        </div>
      </Section>
    </SectionStack>
  )
}
