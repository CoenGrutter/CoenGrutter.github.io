import Container from "@/components/Container";
import CredlyEmbed from "@/components/CredlyEmbed";
import { useEffect, useRef, Suspense, useState } from "react";
import styles from "@/styles/Home.module.css";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,

} from "lucide-react";
import { TriangleDownIcon } from "@radix-ui/react-icons";

import Link from "next/link";
import { cn, scrollTo } from "@/lib/utils";


import {

  type CarouselApi,
} from "@/components/ui/carousel";
import VanillaTilt from "vanilla-tilt";






export default function Home() {
  const refScrollContainer = useRef(null);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState<number>(0);
  const [count, setCount] = useState<number>(0);

  // handle scroll
  useEffect(() => {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-link");

    async function getLocomotive() {
      const Locomotive = (await import("locomotive-scroll")).default;
      new Locomotive({
        el: refScrollContainer.current ?? new HTMLElement(),
        smooth: true,
      });
    }

    function handleScroll() {
      let current = "";
      setIsScrolled(window.scrollY > 0);

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 250) {
          current = section.getAttribute("id") ?? "";
        }
      });

      navLinks.forEach((li) => {
        li.classList.remove("nav-active");

        if (li.getAttribute("href") === `#${current}`) {
          li.classList.add("nav-active");
          console.log(li.getAttribute("href"));
        }
      });
    }

    void getLocomotive();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!carouselApi) return;

    setCount(carouselApi.scrollSnapList().length);
    setCurrent(carouselApi.selectedScrollSnap() + 1);

    carouselApi.on("select", () => {
      setCurrent(carouselApi.selectedScrollSnap() + 1);
    });
  }, [carouselApi]);

  // card hover effect
  useEffect(() => {
    const tilt: HTMLElement[] = Array.from(document.querySelectorAll("#tilt"));
    VanillaTilt.init(tilt, {
      speed: 300,
      glare: true,
      "max-glare": 0.1,
      gyroscope: true,
      perspective: 900,
      scale: 0.9,
    });
  }, []);

  return (
    <Container>
      <div ref={refScrollContainer}>
        <Gradient />

        {/* Intro */}
        <section
          id="home"
          data-scroll-section
          className="mt-40 flex w-full flex-col items-center xl:mt-0 xl:min-h-screen xl:flex-row xl:justify-between"
        >
          <div className={styles.intro}>
            <div>
              <h1
                data-scroll
                data-scroll-enable-touch-speed
                data-scroll-speed=".06"
                data-scroll-direction="horizontal"
              >
                <span className="text-6xl tracking-tighter text-foreground 2xl:text-8xl">
                  Hi, I&apos;m
                  <br />
                </span>
                <span className="clash-grotesk text-gradient text-6xl 2xl:text-8xl">
                  Coen
                </span>
              </h1>
              <p
                data-scroll
                data-scroll-enable-touch-speed
                data-scroll-speed=".06"
                className="mt-1 max-w-lg tracking-tight text-muted-foreground 2xl:text-xl"
              >
                Student software developer specializing in web development and working in the cloud. <br></br> Currently in my final year of college
              </p>
            </div>
            <span
              data-scroll
              data-scroll-enable-touch-speed
              data-scroll-speed=".06"
              className="flex flex-row items-center space-x-1.5 pt-6"
            >
              <Link href="mailto:gruttercoen@gmail.com" passHref>
                <Button>
                  Get in touch <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => scrollTo(document.querySelector("#about"))}
              >
                Learn more
              </Button>
            </span>

            <div
              className={cn(
                styles.scroll,
                isScrolled && styles["scroll--hidden"],
              )}
            >
              Scroll to discover{" "}
              <TriangleDownIcon className="mt-1 animate-bounce" />
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" data-scroll-section>
                    {/* Gradient */}
          <div className="relative isolate -z-10">
            <div
              className="absolute inset-x-0 -top-40 transform-gpu overflow-hidden blur-[100px] sm:-top-80 lg:-top-60"
              aria-hidden="true"
            >
              <div
                className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary via-primary to-secondary opacity-10 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                style={{
                  clipPath:
                    "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                }}
              />
            </div>
          </div>
          <div
            data-scroll
            data-scroll-speed=".4"
            data-scroll-position="top"
            className="my-14 flex max-w-6xl flex-col justify-start space-y-10"
          >
            <span className="text-gradient clash-grotesk text-sm font-semibold tracking-tighter">
              About Me
            </span>
            <h2 className="mt-1.5 text-base tracking-tight text-muted-foreground xl:text-lg">
            {/* TODO: edit je info*/}
            I&apos;m a problem solver. And a problem finder, I just realized. It&apos;s what makes me stand out. <br></br>
            I think critically about processes that others deem optimized, and question why we do things the way we do. <br></br>
            This mindset is what got me into software development; The ability to build anything I want, with the only limitation, my own imagination. <br></br>
            <br></br>
            <br></br>
            In my free time, I play table tennis! Check out my rating progression over the years: <br></br>
            
          </h2>
          {/* rating chart */}
          <div className="max-w-3xl px-4">
            <RatingProgression />
          </div>
          </div>
        </section>

{/*#uncomment from here... */}

        <section id="skills" data-scroll-section>
          
          <div className="relative isolate -z-10">
            <div
              className="absolute inset-x-0 -top-40 transform-gpu overflow-hidden blur-[100px] sm:-top-80 lg:-top-60"
              aria-hidden="true"
            >
              <div
                className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary via-primary to-secondary opacity-10 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                style={{
                  clipPath:
                    "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                }}
              />
            </div>
          </div>
          <div data-scroll data-scroll-speed=".4" className="my-64">
            <span className="text-gradient clash-grotesk text-sm font-semibold tracking-tighter">
              🛠 Skills
            </span>



            <h2 className="mt-3 text-4xl font-semibold tracking-tight tracking-tighter xl:text-2xl">
              Cloud 
            </h2>
            <p className="mt-1.5 text-base tracking-tight text-muted-foreground xl:text-lg">
              Experience deploying to AWS, using various services such as: <br></br> 
              - EC2, ECS and Lambda for backends <br></br>
              - S3 (static website hosting) for frontends <br></br>
              - RDS and DynamoDB for databases <br></br>
            </p>
            

            <h2 className="mt-3 text-4xl font-semibold tracking-tight tracking-tighter xl:text-2xl">
              Backend
            </h2>
            <p className="mt-1.5 text-base tracking-tight text-muted-foreground xl:text-lg">
              Experience designing RESTful APIs, and building backends with Java, Python, and Go
            </p>


            <h2 className="mt-3 text-4xl font-semibold tracking-tight tracking-tighter xl:text-2xl">
              Databases
            </h2>
            <p className="mt-1.5 text-base tracking-tight text-muted-foreground xl:text-lg">
              Experience with both SQL and NoSQL, using databases such as PostgreSQL and DynamoDB
            </p>


            <h2 className="mt-3 text-4xl font-semibold tracking-tight tracking-tighter xl:text-2xl">
              Frontend
            </h2>
            <p className="mt-1.5 text-base tracking-tight text-muted-foreground xl:text-lg">
              Experience developing frontends using various frameworks such as React, Vue and Angular 
            </p>



      
            <h2 className="mt-3 text-4xl font-semibold tracking-tight tracking-tighter xl:text-2xl">
              Scrum
            </h2>
            <p className="mt-1.5 text-base tracking-tight text-muted-foreground xl:text-lg">
              Experience practising Scrum methodologies as developer, scrum master and product owner, during ceremonies such as sprint planning, review, retrospective and daily standups.
            </p>
            
          </div>

        </section>

{/* till here. }       

        {/* Projects */}
        <section id="projects" data-scroll-section>
          {/* Gradient */}
          <div className="relative isolate -z-10">
            <div
              className="absolute inset-x-0 -top-40 transform-gpu overflow-hidden blur-[100px] sm:-top-80 lg:-top-60"
              aria-hidden="true"
            >
              <div
                className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary via-primary to-secondary opacity-10 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                style={{
                  clipPath:
                    "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                }}
              />
            </div>
          </div>
          <div data-scroll data-scroll-speed=".4" className="my-64">
            <span className="text-gradient clash-grotesk text-sm font-semibold tracking-tighter">
              ✨ Projects
            </span>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight tracking-tighter xl:text-4xl">
              SQLQuerryAssist
            </h2>
            <p className="mt-1.5 text-base tracking-tight text-muted-foreground xl:text-lg">
              The goal of the SQLQueryAssist was to let users query their databases using natural language. It utilized a large language model to analyze the users database, so that it could convert data requests into SQL queries, which were then executed, returning the requested data.
            </p>

            {/* <h2 className="mt-3 text-4xl font-semibold tracking-tight tracking-tighter xl:text-6xl">
              Project Two
            </h2>
            <p className="mt-1.5 text-base tracking-tight text-muted-foreground xl:text-lg">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p> */}

          </div>
        </section>

        {/* Experience */}
        <section id="experience" data-scroll-section>
                    {/* Gradient */}
          <div className="relative isolate -z-10">
            <div
              className="absolute inset-x-0 -top-40 transform-gpu overflow-hidden blur-[100px] sm:-top-80 lg:-top-60"
              aria-hidden="true"
            >
              <div
                className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary via-primary to-secondary opacity-10 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                style={{
                  clipPath:
                    "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                }}
              />
            </div>
          </div>
          <div
            data-scroll
            data-scroll-speed=".4"
            data-scroll-position="top"
            className="my-24 flex flex-col justify-start space-y-10"
          >
          </div>
          <div className="flex flex-col space-y-3">
         <span className="text-gradient clash-grotesk text-sm font-semibold tracking-tighter">
            My Experience
          </span>

          <span>
            <label> <Link href="https://sue.nl/" target="_blank" className="text-3xl font-semibold tracking-tight xl:text-4xl underline" >Sue</Link> <span className="ml-2 text-base font-normal text-muted-foreground align-middle">Feb 2025 - Jul 2025</span> </label>
            <p className="mt-1.5 text-base tracking-tight text-muted-foreground xl:text-lg"> During my internship at Sue, I researched how LLMs could be used to automatically monitor and analyze cloud infrastructure. I also dove into the workings of the Model Context Protocol, and how it could be applied to realize LLM driven AI agents that can automatically manage cloud infrastructure.</p>
          </span>
          <br></br>
          </div>
        </section>
   
       
        {/* Certifications */}
        <section id="certifications" data-scroll-section>
          {/* Gradient */}
          <div className="relative isolate -z-10">
            <div
              className="absolute inset-x-0 -top-40 transform-gpu overflow-hidden blur-[100px] sm:-top-80 lg:-top-60"
              aria-hidden="true"
            >
              <div
                className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary via-primary to-secondary opacity-10 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                style={{
                  clipPath:
                    "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                }}
              />
            </div>
          </div>
          <div
            data-scroll
            data-scroll-speed=".4"
            data-scroll-position="top"
            className="my-24 flex flex-col justify-start space-y-10"
          >
            <div className="flex flex-col space-y-3">
              <span className="text-gradient clash-grotesk text-sm font-semibold tracking-tighter">
                🎓 Certifications
              </span>
              <h2 className="text-3xl font-semibold tracking-tight xl:text-3xl">
                These certifications serve as a proof of my expertise, and my commitment to continuous learning
              </h2>
              <CredlyEmbed badgeId="9ffd2bbe-5fa6-4f48-bc9b-f10fd0ec77c4" />
              <CredlyEmbed badgeId="5f469b04-5a86-4c81-8f29-50b5413c1f1c" />
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" data-scroll-section className="my-64">
                    {/* Gradient */}
          <div className="relative isolate -z-10">
            <div
              className="absolute inset-x-0 -top-40 transform-gpu overflow-hidden blur-[100px] sm:-top-80 lg:-top-60"
              aria-hidden="true"
            >
              <div
                className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary via-primary to-secondary opacity-10 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                style={{
                  clipPath:
                    "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                }}
              />
            </div>
          </div>
          <div
            data-scroll
            data-scroll-speed=".4"
            data-scroll-position="top"
            className="flex flex-col items-center justify-center rounded-lg bg-gradient-to-br from-primary/[6.5%] to-white/5 px-8 py-16 text-center xl:py-24"
          >
            <h2 className="text-4xl font-medium tracking-tighter xl:text-6xl">
              For contact:
            </h2>
            <Link href="mailto:gruttercoen@gmail.com" passHref>
              <Button className="mt-6">gruttercoen@gmail.com</Button>
            </Link>
          </div>
        </section>
      </div>
    </Container>
  );
}

function Gradient() {
  return (
    <>
      {/* Upper gradient */}
      <div className="absolute -top-40 right-0 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <svg
          className="relative left-[calc(50%-11rem)] -z-10 h-[21.1875rem] max-w-none -translate-x-1/2 rotate-[30deg] sm:left-[calc(50%-30rem)] sm:h-[42.375rem]"
          viewBox="0 0 1155 678"
        >
          <path
            fill="url(#45de2b6b-92d5-4d68-a6a0-9b9b2abad533)"
            fillOpacity=".1"
            d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
          />
          <defs>
            <linearGradient
              id="45de2b6b-92d5-4d68-a6a0-9b9b2abad533"
              x1="1155.49"
              x2="-78.208"
              y1=".177"
              y2="474.645"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#7980fe" />
              <stop offset={1} stopColor="#f0fff7" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Lower gradient */}
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <svg
          className="relative left-[calc(50%+3rem)] h-[21.1875rem] max-w-none -translate-x-1/2 sm:left-[calc(50%+36rem)] sm:h-[42.375rem]"
          viewBox="0 0 1155 678"
        >
          <path
            fill="url(#ecb5b0c9-546c-4772-8c71-4d3f06d544bc)"
            fillOpacity=".1"
            d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
          />
          <defs>
            <linearGradient
              id="ecb5b0c9-546c-4772-8c71-4d3f06d544bc"
              x1="1155.49"
              x2="-78.208"
              y1=".177"
              y2="474.645"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#9A70FF" />
              <stop offset={1} stopColor="#838aff" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </>
  );
}

function RatingProgression() {
  
  const [raw, setRaw] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tip, setTip] = useState<null | { x: number; y: number; label: string }>(null);

  useEffect(() => {
    async function fetchRatingData() {
      try {
        const response = await fetch(
          "https://www.nttb-ranglijsten.nl/dwf/v2/?get_results=Coen Grutter",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "username=0&jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6MH0.LPOp5onOcE3YSYUle0ewlCWuZ1nkCfw1NsMw9ru3QnY%0A&user=4182105&bno=4182105&comp=anything",
          }
        );

        if (!response.ok) throw new Error("Failed to fetch rating data");

    
        const data = await response.json();

        const resultsArray = JSON.parse(data.results);
        const ratingsObj = resultsArray[0];
        setRaw(ratingsObj);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchRatingData();
  }, []);

  if (loading) return <div className="text-muted-foreground">Loading rating data...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!raw) return null;


  const series: { date: Date; rating: number }[] = Object.keys(raw)
    .map((k) => {
      const [year, half] = k.split("_");
      const month = half === "1" ? 0 : 6; // Jan = 0, Jul = 6

      return { date: new Date(Number(year), month, 1), rating: Number(raw![k]) };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const padding = { top: 12, right: 24, bottom: 28, left: 48 };
  const width = 760;
  const height = 260;

  if (!series || series.length === 0) return null;

  const maxRating = Math.max(...series.map((s) => s.rating));
  const maxY = Math.ceil(maxRating / 500) * 500;

  const xFor = (index: number) => {
    const pct = index / (series.length - 1 || 1);
    return padding.left + pct * (width - padding.left - padding.right);
  };

  const yFor = (r: number) => {
    const pct = r / (maxY || 1);
    return height - padding.bottom - pct * (height - padding.top - padding.bottom);
  };

  const pathD = series
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(p.rating)}`)
    .join(" ");

  return (
    <div className="mt-6">
      {/* <div className="mb-3 text-sm font-semibold text-muted-foreground">Rating progression</div> */}
      <div className="rounded-md bg-gradient-to-br from-white/5 to-white/3 p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img">
          {/* Y grid + labels */}
          {Array.from({ length: Math.floor(maxY / 500) + 1 }).map((_, i) => {
            const r = i * 500;
            const y = yFor(r);
            return (
              <g key={r}>
                <line
                  x1={padding.left}
                  x2={width - padding.right}
                  y1={y}
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                />
                <text x={12} y={y + 4} fill="rgba(255,255,255,0.7)" fontSize={11}>
                  {r}
                </text>
              </g>
            );
          })}

          {/* X labels */}
          {(() => {
            const years = new Set<number>();
            const yearIndices: { year: number; index: number }[] = [];
            series.forEach((s, i) => {
              const year = s.date.getFullYear();
              if (!years.has(year)) {
                years.add(year);
                yearIndices.push({ year, index: i });
              }
            });
            return yearIndices.map((item, i) => (
              <text
                key={i}
                x={xFor(item.index)}
                y={height - 6}
                textAnchor="middle"
                fill="rgba(255,255,255,0.65)"
                fontSize={11}
              >
                {item.year}
              </text>
            ));
          })()}

          {/* line shadow */}
          <path d={pathD} fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
          {/* main line */}
          <path d={pathD} fill="none" stroke="#7C5CFC" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />

          {/* points */}
          {series.map((s, i) => {
            const x = xFor(i);
            const y = yFor(s.rating);
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r={5}
                  fill="#fff"
                  stroke="#7C5CFC"
                  strokeWidth={2}
                  onMouseEnter={(e) =>
                    setTip({ x: e.clientX, y: e.clientY, label: `${s.date.getFullYear()} ${s.date.getMonth() === 0 ? "Jan" : "Jul"}: ${s.rating}` })
                  }
                  onMouseMove={(e) =>
                    setTip({ x: e.clientX, y: e.clientY, label: `${s.date.getFullYear()} ${s.date.getMonth() === 0 ? "Jan" : "Jul"}: ${s.rating}` })
                  }
                  onMouseLeave={() => setTip(null)}
                />
              </g>
            );
          })}
        </svg>

        {tip && (
          <div
            style={{ position: "fixed", left: tip.x + 12, top: tip.y + 12, pointerEvents: "none" }}
            className="rounded-md bg-foreground/95 px-3 py-1 text-sm text-background"
          >
            {tip.label}
          </div>
        )}
      </div>
    </div>
  );
}
