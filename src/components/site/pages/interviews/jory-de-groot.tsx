/* eslint-disable react/no-unescaped-entities, @next/next/no-img-element */
// Gegenereerd uit interview-jory-de-groot.php.html met html2tsx. Aanpassen kan gewoon handmatig.
import Link from "next/link";
import { SITE_BASE as base } from "@/components/site/site-config";

export const meta = {
  title: "Social Entrepreneurship Within an Organisation | Interview",
  description: "",
};

export function InterviewContent() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero__container">
          <div className="page-hero__heading">
            <h1 className="page-hero__title">Interview</h1>
            <h2 className="page-hero__subtitle">
              Social Entrepreneurship Within an Organisation
            </h2>
          </div>
          <p className="page-hero__description">
            Interview with
            <br />
            Jory de Groot
            <br />
            Job Appointment Coordinator, Dutch Police
            <br />
            Social Entrepreneurship Programme
          </p>
        </div>
      </section>
      <div className="container">
        <main className="main-content">
          <div className="article-feature-image">
            <img
              src="/wstf/images/interview/JorydeGroot.jpg"
              alt="Jory de Groot, Job Appointment Coordinator at the Dutch Police"
            />
          </div>
          <p className="lead-paragraph">
            Have a social impact with your work within a large organization.
            Jory de Groot does it! She works for the police as a Job Appointment
            coordinator and creates jobs for people with a distance from the
            labor market. To give more body to her social entrepreneurship, she
            has decided to participate in the Social Entrepreneurship Course in
            2021.
          </p>
          <p className="lead-paragraph">
            “I regularly speak to candidates who always dreamed of working for
            the police, but thought they couldn't because of their disability,”
            says Jory. "Such a story motivates me, then I just go a step hard to
            find a suitable position for him or her."
          </p>
          <section id="section-1" className="article-section">
            <h2>Read camera images</h2>
            <p>
              Jory worked at the investigation service until a year ago. During
              her volunteer work with people with disabilities, Jory discovered
              that people with autism are likely to be very good at recognizing
              people in crowds. "When we went to look at camera footage for a
              few hundred hours at one point looking for suspects, I thought of
              that." And the new 'camera image specialist' position was a fact,
              filled in by people with autism. Precisely because of their
              limitation, they can read well-focused camera images.
            </p>
          </section>
          <blockquote>
            <p>
              “In the past year, we have created 60 jobs for people with a
              distance to the labor market.”
            </p>
          </blockquote>
          <section id="section-2" className="article-section">
            <p>
              “After this project, we started to look wider. In the past year,
              we have created 60 jobs for people with a distance to the labor
              market. For example, for people with visual impairments who listen
              to or extinguish conversation recordings and hearing impaired
              people who run a coffee bar.”
            </p>
          </section>
          <section id="section-3" className="article-section">
            <h2>Social entrepreneurship</h2>
            <p>
              Jory has long focused on developing various initiatives, without
              being aware that this is a form of social entrepreneurship. Partly
              through contact with social entrepreneurs during her work, that
              realization came, and she decided to follow an education to
              further develop her entrepreneurship.
              <br />
              During the Social Entrepreneurship Course, she hopes, among other
              things, to learn to think and act more commercially. “The police
              are a non-profit organization, but initiatives must have an impact
              here,” Jory says. “For the scaling up and rolling out of projects,
              it is important to think more commercially. I think you create
              more support and the roll-out of projects is easier, when you can
              show both the social and financial value of a project.”
            </p>
          </section>
          <blockquote>
            <p>"The vision and the social purpose are central."</p>
          </blockquote>
          <section id="section-4" className="article-section">
            <h2>Big impact</h2>
            <p>
              “Because the police are a huge organization and employer, I can
              hardly have such an impact with my work anywhere. My ambition is
              that working for the police will soon be possible for everyone.
              It's nice to be able to work on that. With this course, I also
              want to investigate how I can do that more from a separate social
              enterprise within the police.”
              <br />
              What does Jory appeal to about social entrepreneurship? “The
              vision and the social goal are central, not just the profit. You
              are also working on innovations that contribute to a livable world
              for everyone. Something we all need.”
            </p>
          </section>
          <section id="section-5" className="article-section">
            <h2></h2>
            <p></p>
          </section>
        </main>
        <aside className="sidebar">
          <div className="sidebar-card">
            <h3>Participant</h3>
            <div className="speakers-grid">
              <div className="speaker-item">
                <img
                  className="speaker-avatar"
                  src="/wstf/images/avatar/JorydeGroot.jpg"
                  alt="Portrait of Jory de Groot, Job Appointment Coordinator at the Dutch Police"
                />
                <div className="speaker-info">
                  <h4>Jory de Groot</h4>
                  <p>Job Appointment Coordinator, Dutch Police</p>
                </div>
              </div>
            </div>
          </div>
          <nav className="sidebar-card nav-card">
            <h3>In This Interview</h3>
            <ul>
              <li>
                <Link href={`${base}/interview/jory-de-groot`}>
                  {" "}
                  1. Read camera images{" "}
                </Link>
              </li>
              <li>
                <Link href={`${base}/interview/jory-de-groot`}>
                  {" "}
                  2. Social entrepreneurship{" "}
                </Link>
              </li>
              <li>
                <Link href={`${base}/interview/jory-de-groot`}>
                  {" "}
                  3. Big impact{" "}
                </Link>
              </li>
              <li>
                <Link href={`${base}/interview/jory-de-groot`}> </Link>
              </li>
            </ul>
          </nav>
        </aside>
      </div>
    </>
  );
}
