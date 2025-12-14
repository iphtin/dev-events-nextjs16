import { EventDocument } from "@/database";
import EventCard from "./EventCard";
import BookEvent from "./BookEvent";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getSimilarEventsBySlug } from "@/lib/actions/event.action";
import { cacheLife } from "next/cache";
import {events} from '@/lib/constants';

const event = {
  _id: "693b214dc14ccb5fbf64b22b",
  title: "Cloud Next 2027",
  description: "Google’s premier cloud computing event, showcasing innovations in AI, infrastructure, and enterprise solutions.",
  overview: "Cloud Next 2025 highlights the latest in cloud-native development, Kubernetes, AI, and enterprise scalability. Developers, architects, and executives gather to learn about new Google Cloud services, best practices, and success stories.",
  image: "https://res.cloudinary.com/darzppmps/image/upload/v1765482828/DevEvent/ii4dlwxzdjllab3f3qhf.webp",
  venue: "Moscone Center",
  location: "San Francisco, CA",
  date: "2025-04-10T00:00:00.000Z",
  time: "08:30",
  mode: "hybrid",
  audience: "Cloud engineers, DevOps, enterprise leaders, AI researchers",
  agenda: [
    "[\n    \"08:30 AM - 09:30 AM | Keynote: AI-Driven Cloud Infrastructure\",\n    \"09:45 AM - 11:00 AM | Deep Dives: Kubernetes, Data Analytics, Security\",\n    \"11:15 AM - 12:30 PM | Product Demos & Networking\",\n    \"12:30 PM - 01:30 PM | Lunch\",\n    \"01:30 PM - 03:00 PM | Workshops: Scaling with GCP\",\n    \"03:15 PM - 04:30 PM | Fireside Chat: The Future of Enterprise Cloud\"\n  ]"
  ],
  organizer: "Google Cloud organizes Cloud Next to connect global businesses, developers, and innovators with the latest technologies and best practices in cloud computing.",
  tags: [
    " [\"Cloud\", \"DevOps\", \"Kubernetes\", \"AI\"]"
  ],
  createdAt: {
    "$date": "2025-12-11T19:53:49.721Z"
  },
  updatedAt: {
    "$date": "2025-12-11T19:53:49.721Z"
  },
  slug: "cloud-next-2027",
  "__v": 0
}

const EventDetailItem = ({ icon, alt, label }: {icon: string, alt: string, label: string}) => (
   <div className="flex flex-row gap-2 items-center">
    <Image src={icon} alt={alt} width={17} height={17} />
    <p>{label}</p>
   </div>
)
const EventAgenda = ({agendaItems}: {agendaItems: string[]}) => (
  <div className="agenda">
    <h2>Agenda</h2>
    <ul>
      {agendaItems.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
)

const EventTags = ({ tags }: { tags: string[]}) => (
  <div className="flex flex-row gap-1.5 flex-wrap">
    {tags.map((tag) => (
      <div className="pill" key={tag}>
        {tag}
      </div>
    ))}
  </div>
)


const EventDetails = async ({ params }: {params: Promise<string>}) => {

  const slug = await params;

  let {title, _id, description, image, overview, date, time, location, agenda, organizer, tags, audience, mode} = event;


  if(!description) return notFound();

  const bookings = 10;

  const similarEvents: EventDocument[] = await getSimilarEventsBySlug(slug);

  return (
    <section id="event">
      <div className="header">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      <div className="details">
        {/* left side - Event Content  */}
        <div className="content">
          <Image src={image} alt='Event Banner' width={800} height={800} className="banner" />

          <section className="flex-col gap-2">
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>

          <section className="flex-col gap-2">
            <h2>Event Details</h2>

            <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={new Date(date).toLocaleDateString()} />
            <EventDetailItem icon="/icons/clock.svg" alt="clock" label={time} />
            <EventDetailItem icon="/icons/pin.svg" alt="pin" label={location} />
            <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
            <EventDetailItem icon="/icons/audience.svg" alt="audience" label={audience} />
          </section>

          <EventAgenda agendaItems={agenda} />
          <section className="flex flex-col gap-2">
            <h2>About the Organizer</h2>
            <p>{organizer}</p>
          </section>
          {/* <EventTags tags={JSON.parse(tags[0])} /> */}

          <EventTags tags={tags} />

          </div>
        {/* Right Side - Booking Form */}
        <aside className="booking">
          <div className="signup-card">
            <h2>Book Your Spot</h2>
            {bookings > 0 ? (
              <p className="text-sm">Join {bookings} people who have already booked their spot!</p>
            ): (
              <p className="text-sm">Be the first to book your spot!</p>
            )}

            <BookEvent eventId={_id} slug={slug} />
          </div>
        </aside>
      </div>

      <div className="flex flex-col w-full gap-4 pt-20">
         <h2>Similar Events</h2>
         <div className="events">
           {similarEvents.length > 0 && similarEvents.map((similarEvent: EventDocument) => (
             <EventCard key={similarEvent.title} {...similarEvent} />
           ))}
         </div>
      </div>
    </section>
  )
}

export default EventDetails