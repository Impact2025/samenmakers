/* eslint-disable react/no-unescaped-entities, @next/next/no-img-element */
// Gegenereerd uit interview-mariska-komproe.php.html met html2tsx. Aanpassen kan gewoon handmatig.
import Link from "next/link";
import { SITE_BASE as base } from "@/components/site/site-config";

export const meta = {
  title: "Interview Mariska Komproe | We Shape the Future",
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
              Social Entrepreneurs Receive Their Certificates
            </h2>
          </div>
          <p className="page-hero__description">
            Mariska Komproe
            <br />
            Founder, Talentcoach
            <br />
            Social Entrepreneurship Programme
          </p>
        </div>
      </section>
      <div className="container">
        <main className="main-content">
          <div className="article-feature-image">
            <img
              src="/wstf/images/interview/maris-portretfoto.jpg"
              alt="Social Entrepreneurship Programme participants receiving their certificates"
            />
          </div>
          <p className="lead-paragraph">
            Last year, the first Social Entrepreneurship Course (LSO) took place
            at Nyenrode Business University. 'As a social entrepreneur, I do a
            lot on feeling,' says participant Mariska Komproe. 'The training
            confirms that I am doing well, on the right track. I feel stronger,
            more confident.
          </p>
          <p className="lead-paragraph">
            Mariska Komproe is the founder of Talentcoach. Talentcoach offers
            programs to companies that link the development of their
            professionals (human resources) to social issues (social
            responsibility for corporate). Mariska: 'As a social entrepreneur,
            you are sometimes a strange duck in the bite. You have an extra
            challenge; namely making money and creating social impact. That
            creates dilemmas and difficult choices that you have to make for
            your business. In addition, the outside world often has a wrong
            image of your organization. People think it's beautiful and cool,
            but don't see that it's hard work. It is nice that the training
            takes you seriously as a social entrepreneur and has an eye for
            that.
          </p>
          <blockquote>
            <p>
              “As a social entrepreneur, you are sometimes a strange duck in the
              bite. You have an extra challenge; namely making money and
              creating social impact.”
            </p>
          </blockquote>
          <section id="section-1" className="article-section">
            <h2>Confirmation for entrepreneurs</h2>
            <p>
              'Sometimes you have to step out of your organization and make time
              to think: what am I doing? Is my organization going in the right
              direction? As an entrepreneur, there is not always someone who
              tells you what to do. With LSO we go through all facets such as
              financing, marketing, organization and impact measurement. It is
              the ideal checklist where I can tick my organization. It's
              immediately applicable, I like that.'
            </p>
          </section>
          <section id="section-2" className="article-section">
            <h2>Inspiring speakers</h2>
            <p>
              During the training, various speakers from the business world will
              have their say. 'Kelly Liket, for example, talked about impact
              measurement. Does the social aspect of your business benefit
              society? We are not involved in the measurement ourselves, but the
              social impact is important to us. The information on how to choose
              legal forms for your company is also relevant to us, because we
              are looking at whether we can continue Talentcoach as a B.V.'
              Mariska drew the most inspiration from the stories of other
              entrepreneurs: 'Entrepreneurship is trial and error. We got a
              wonderfully recognizable look in the kitchen.'
            </p>
          </section>
          <blockquote>
            <p>
              “It is the ideal checklist where I can tick my organization. It's
              immediately applicable, I like that.”
            </p>
          </blockquote>
          <section id="section-2" className="article-section">
            <h2>Pitfalls of social entrepreneurs</h2>
            <p>
              'The weekend with the theme Rockefeller Habits was very
              interesting', says Mariska. During Rockefeller Habits, commercial
              entrepreneurs give advice on how to have a healthy financial
              organization. The most important tip? Invest in the right people.
              Mariska: 'I have had the pitfall of hiring people with a lot of
              passion for my order taking, but I don't know if they are the best
              for the position. You also have people who are very good at their
              work, but do not fit the core values of your organization. In the
              end, they cost so much energy that your top people resign with a
              passion for the business and the right qualities. In a small
              business like ours, it's a big problem if someone drops out.
              During Rockefeller Habits we were given tools and solutions to
              make choices easier.'
            </p>
          </section>
          <section id="section-4" className="article-section">
            <h2>Profit is in network</h2>
            <p>
              'The profit of the training is mainly in the contact with other
              social entrepreneurs', says Mariska Komproe. 'Before I started
              LSO, I was about to quit Talent Coach. I no longer got
              satisfaction from the duties as director, I wanted to develop and
              tackle projects myself again. But now I walked on Thursday with
              questions from work, which I could ask the group on Friday morning
              during intervision. That was very nice. It is a safe setting where
              everyone dares to be vulnerable. As a result, you recognize a lot
              in each other and you also learn a lot from each other. Everyone
              is very open. Thanks to the theoretical lessons and the
              experiential interviews, I have gained the insight that I can set
              up the organization again so that Talentcoach fits me again and
              can steer it in a direction that makes me excited again. I felt
              like going on with my business again.'
            </p>
          </section>
          <blockquote>
            <p>“I felt like going on with my business again.”</p>
          </blockquote>
        </main>
        <aside className="sidebar">
          <div className="sidebar-card">
            <h3>Featured Participant</h3>
            <div className="speakers-grid">
              <div className="speaker-item">
                <img
                  className="speaker-avatar"
                  src="/wstf/images/avatar/maris-portretfoto.jpg"
                  alt="Mariska Komproe, founder of Talentcoach"
                />
                <div className="speaker-info">
                  <h4>Mariska Komproe</h4>
                  <p>Founder, Talentcoach</p>
                </div>
              </div>
            </div>
          </div>
          <nav className="sidebar-card nav-card">
            <h3>In This Interview</h3>
            <ul>
              <li>
                <Link href={`${base}/interview/mariska-komproe`}>
                  {" "}
                  1. Confirmation for entrepreneurs{" "}
                </Link>
              </li>
              <li>
                <Link href={`${base}/interview/mariska-komproe`}>
                  {" "}
                  2. Inspiring speakers{" "}
                </Link>
              </li>
              <li>
                <Link href={`${base}/interview/mariska-komproe`}>
                  {" "}
                  3. Pitfalls of social entrepreneurs{" "}
                </Link>
              </li>
              <li>
                <Link href={`${base}/interview/mariska-komproe`}>
                  {" "}
                  4. Profit is in network{" "}
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
      </div>
    </>
  );
}
