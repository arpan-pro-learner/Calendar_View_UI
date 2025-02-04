import { createContext, useState, useContext, useEffect } from "react";
import { startOfMonth } from "date-fns";
import PropTypes from "prop-types";

const CalendarContext = createContext(undefined);

const initialResources = [
  { id: "resource-1", name: "Resource A" },
  { id: "resource-2", name: "Resource B" },
  { id: "resource-3", name: "Resource C" },
];

const colors = [
  "bg-blue-200 hover:bg-blue-300",
  "bg-pink-200 hover:bg-pink-300",
  "bg-green-200 hover:bg-green-300",
  "bg-yellow-200 hover:bg-yellow-300",
  "bg-purple-200 hover:bg-purple-300",
  "bg-orange-200 hover:bg-orange-300",
];

export function CalendarProvider({ children }) {
  const [currentDate, setCurrentDate] = useState(() => startOfMonth(new Date()));
  const [resources, setResources] = useState(() => {
    const saved = localStorage.getItem("resources");
    return saved ? JSON.parse(saved) : initialResources;
  });

  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem("events");
    return saved
      ? JSON.parse(saved).map((event) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }))
      : [];
  });

  const [selectedRange, setSelectedRange] = useState({ start: null, end: null });

  useEffect(() => {
    localStorage.setItem("resources", JSON.stringify(resources));
  }, [resources]);

  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  const addResource = () => {
    const newResource = {
      id: `resource-${resources.length + 1}`,
      name: `Resource ${String.fromCharCode(65 + resources.length)}`,
    };
    setResources([...resources, newResource]);
  };

  const removeResource = (id) => {
    setResources(resources.filter((resource) => resource.id !== id));
    setEvents(events.filter((event) => event.resourceId !== id));
  };

  const addEvent = (eventData) => {
    const newEvent = {
      ...eventData,
      id: `event-${Date.now()}`,
      color: colors[events.length % colors.length],
    };
    setEvents([...events, newEvent]);
  };

  const updateEvent = (updatedEvent) => {
    setEvents(events.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)));
  };

  const deleteEvent = (id) => {
    setEvents(events.filter((event) => event.id !== id));
  };

  return (
    <CalendarContext.Provider
      value={{
        currentDate,
        setCurrentDate,
        resources,
        addResource,
        removeResource,
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        selectedRange,
        setSelectedRange,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

CalendarProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return context;
}
