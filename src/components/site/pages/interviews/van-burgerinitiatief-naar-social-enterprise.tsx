/* eslint-disable react/no-unescaped-entities, @next/next/no-img-element */
// Gegenereerd uit interview-van-burgerinitiatief-naar-social-enterprise.php.html met html2tsx. Aanpassen kan gewoon handmatig.
import Link from "next/link";
import { SITE_BASE as base } from "@/components/site/site-config";

export const meta = {
  title: "From Community Initiative to Social Enterprise | Interview",
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
              From Community Initiative to Social Enterprise
            </h2>
          </div>
          <p className="page-hero__description">
            Interview with
            <br />
            Erwin van Asselt
            <br />
            Founder &amp; Initiator, BuurtMaaltijden
            <br />
            Social Entrepreneurship Programme
          </p>
        </div>
      </section>
      <div className="container">
        <main className="main-content">
          <div className="article-feature-image">
            <img
              src="/wstf/images/interview/Erwin-van-Asselt.png"
              alt="Erwin van Asselt"
            />
          </div>
          <p className="lead-paragraph">
            What began as a neighborhood initiative to encourage vulnerable
            people in the Utrecht Overvecht district during the first lockdown,
            grew into a social enterprise that has already provided more than
            20,000 meals to people who can use them well in the year and a half
            of its existence. BuurtMaaltijden was allowed to receive the Utrecht
            Volunteer Trophy last year, later she also received the National
            Volunteer Prize from Minister Hugo de Jonge. How did this
            neighborhood initiative that thought it would only exist for a week
            develop into the company it is today?
          </p>
          <blockquote>
            <p>
              'We have indeed grown very fast in a short time,' Erwin van Asselt
              agrees. He is the initiator, promoter and the face of
              BuurtMaaltijden.
            </p>
          </blockquote>
          <section
            id="community-to-social-enterprise"
            className="article-section"
          >
            <p>
              'The idea was to give people in Overvecht some extra attention
              during the first lockdown, which initially seemed to last a week,
              in the form of a good and healthy meal in combination with a nice
              chat. The lockdown was extended by a week, and then by another
              week, and another... In no time, professional chefs were preparing
              meals in our kitchen three times a week. Connection, that was what
              people needed during the lockdown. And connection is what we
              gave.'
            </p>
          </section>
          <blockquote>
            <p>
              In order to continue our social mission, we have started to pursue
              a more commercial strategy.
            </p>
          </blockquote>
          <section id="commercial-strategy" className="article-section">
            <p>
              'We received a lot of positive responses and the applications
              poured in. Until the moment came when we said: we will continue
              professionally. As a volunteer organization, you depend on
              donations, grants and funds. In order to continue our social
              mission, we have decided to pursue a more commercial strategy.'
            </p>
          </section>
          <section id="social-entrepreneurship" className="article-section">
            <h2>Social Entrepreneurship</h2>
            <p>
              ‘In December, I signed up for the Social Entrepreneurship
              Programme. I started with the question of how you turn the vision
              you have into a plan that everyone can support. I came out of it
              with some very valuable lessons.’
            </p>
            <p>
              ‘I had the advantage of not being the most experienced
              entrepreneur in the group. During the training days, I was
              immersed in the experiences of the veterans, hearing about
              obstacles and how you can overcome them, the challenges, the
              mistakes beginners make and the pitfalls you can fall into as an
              experienced entrepreneur. Above all, I learned that having a large
              network of like minded people with the same ambitions as you is
              extremely valuable.’
            </p>
            <p>
              In addition to theoretical knowledge, I also gained more knowledge
              about myself during the programme. This came through the personal
              leadership training, but also through the peer learning sessions.
              Now that I know more about my own motivations, I am more aware of
              my pitfalls and can work better with all the different people
              within our organisation.’
            </p>
          </section>
          <blockquote>
            <p>
              “I have been given the tools to shape our vision and implement our
              chosen strategy in daily practice.”
            </p>
          </blockquote>
          <section id="vision-to-practice" className="article-section">
            <h2>From Vision to Practice</h2>
            <p>
              ‘During the programme, I gained the theoretical foundation we
              needed to turn our vision for the direction of the company into
              concrete material. You can enthusiastically tell your team about
              your plans, but how do you make sure everyone focuses on the same
              things? And how does everything filter through to the smallest
              details and reach all levels of the organisation?
            </p>
            <p>
              During the programme, I was given the practical tools to shape our
              vision and implement our chosen strategy in daily practice. For
              example, we started working with quarterly themes, using internal
              posters to remind everyone what the theme is and how we are
              putting it into practice during that quarter.’
            </p>
            <p>
              ‘Personally, this year has given me peace and structure. Or
              perhaps better: peace through structure. I have been given the
              tools to deal with the challenges of everyday practice, so that I
              am not constantly rushing from one thing to another trying to
              arrange everything, but can manage things more easily.
            </p>
            <p>
              Through hard work, knowing where your strengths lie and where you
              are needed, and having the ability to turn a vision into concrete
              plans, we were able to grow into the organisation we are today
              over the past year and a half.
            </p>
            <p>
              During the programme, I also built the confidence to conquer the
              whole of the Netherlands with our social enterprise.’
            </p>
          </section>
          <section id="get-started" className="article-section">
            <h2></h2>
            <p></p>
            <p></p>
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
                  src="/wstf/images/avatar/Erwin-van-Asselt.png"
                  alt="Erwin van Asselt"
                />
                <div className="speaker-info">
                  <h4>Erwin van Asselt</h4>
                  <p>Founder &amp; Initiator, BuurtMaaltijden</p>
                </div>
              </div>
            </div>
          </div>
          <nav className="sidebar-card nav-card" aria-label="Story navigation">
            <h3>In This Story</h3>
            <ul>
              <li>
                <Link
                  href={`${base}/interview/van-burgerinitiatief-naar-social-enterprise`}
                >
                  {" "}
                  1. From Community Initiative to Social Enterprise{" "}
                </Link>
              </li>
              <li>
                <Link
                  href={`${base}/interview/van-burgerinitiatief-naar-social-enterprise`}
                >
                  {" "}
                  2. Choosing a More Commercial Strategy{" "}
                </Link>
              </li>
              <li>
                <Link
                  href={`${base}/interview/van-burgerinitiatief-naar-social-enterprise`}
                >
                  {" "}
                  3. Social Entrepreneurship{" "}
                </Link>
              </li>
              <li>
                <Link
                  href={`${base}/interview/van-burgerinitiatief-naar-social-enterprise`}
                >
                  {" "}
                  4. From Vision to Practice{" "}
                </Link>
              </li>
              <li>
                <Link
                  href={`${base}/interview/van-burgerinitiatief-naar-social-enterprise`}
                >
                  {" "}
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
      </div>
    </>
  );
}
