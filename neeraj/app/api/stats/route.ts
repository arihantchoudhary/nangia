import { NextResponse } from 'next/server';

export async function GET() {
  // Mock stats data - in a real app, this would query your database
  const stats = {
    callsLastWeek: 47,
    peopleSpokenTo: 23
  };

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  return NextResponse.json(stats);
}