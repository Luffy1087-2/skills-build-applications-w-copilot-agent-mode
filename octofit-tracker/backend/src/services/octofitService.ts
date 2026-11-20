import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function clientError(message: string, status = 400) {
  return Object.assign(new Error(message), { status });
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(_input: unknown) {
  if (!_input || typeof _input !== 'object' || Array.isArray(_input)) {
    throw clientError('Activity input is required');
  }

  const input = _input as Record<string, unknown>;
  const { userId, teamId, type, minutes } = input;

  if (typeof userId !== 'string' || typeof teamId !== 'string') {
    throw clientError('userId and teamId are required');
  }
  if (typeof type !== 'string' || type.trim().length === 0) {
    throw clientError('Activity type is required');
  }
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    throw clientError('Minutes must be a positive number');
  }
  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(teamId)) {
    throw clientError('Invalid userId or teamId');
  }

  const [user, team] = await Promise.all([
    User.findById(userId).lean(),
    Team.findById(teamId).lean(),
  ]);
  if (!user) {
    throw clientError('User not found', 404);
  }
  if (!team) {
    throw clientError('Team not found', 404);
  }

  const activity = await Activity.create({
    user: userId,
    team: teamId,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });

  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(_input: unknown) {
  if (!_input || typeof _input !== 'object' || Array.isArray(_input)) {
    throw clientError('Team input is required');
  }

  const input = _input as Record<string, unknown>;
  const { name, mascot, members } = input;

  if (typeof name !== 'string' || name.trim().length === 0) {
    throw clientError('Team name is required');
  }
  if (typeof mascot !== 'string' || mascot.trim().length === 0) {
    throw clientError('Team mascot is required');
  }

  if (members !== undefined && (!Array.isArray(members) || members.some((member) => typeof member !== 'string'))) {
    throw clientError('Members must be an array of user IDs');
  }

  const memberIds = (members as string[] | undefined) ?? [];
  if (memberIds.some((memberId) => !mongoose.isValidObjectId(memberId))) {
    throw clientError('Invalid member ID');
  }

  const uniqueMemberIds = [...new Set(memberIds)];
  const existingMembers = await User.find({ _id: { $in: uniqueMemberIds } }).select('_id').lean();
  if (existingMembers.length !== uniqueMemberIds.length) {
    throw clientError('One or more members were not found', 404);
  }

  const team = await Team.create({
    name: name.trim(),
    mascot: mascot.trim(),
    members: uniqueMemberIds,
  });

  await User.updateMany(
    { _id: { $in: uniqueMemberIds } },
    { $set: { team: team._id } },
  );

  return team.toObject();
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate<{ _id: mongoose.Types.ObjectId; totalPoints: number }>([
    {
      $group: {
        _id: '$team',
        totalPoints: { $sum: '$points' },
      },
    },
  ]);

  if (totals.length === 0) {
    return [];
  }

  const teams = await Team.find({
    _id: { $in: totals.map(({ _id }) => _id) },
  }).lean();
  const teamNames = new Map(teams.map((team) => [team._id.toString(), team.name]));

  return totals
    .map(({ _id, totalPoints }) => ({
      teamName: teamNames.get(_id.toString()) ?? 'Unknown team',
      totalPoints,
    }))
    .filter(({ teamName }) => teamName !== 'Unknown team')
    .sort((left, right) =>
      right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName),
    )
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(_userEmail: string) {
  if (typeof _userEmail !== 'string' || _userEmail.trim().length === 0) {
    throw clientError('User email is required');
  }

  const user = await User.findOne({ email: _userEmail.trim() }).lean();
  if (!user) {
    throw clientError('User not found', 404);
  }

  const activities = await Activity.find({ user: user._id }).lean();
  const activityTypes = activities.map((activity) => activity.type.toLowerCase());
  let focus = user.fitnessGoal.toLowerCase();

  if (activityTypes.includes('strength')) {
    focus = 'strength';
  } else if (
    activityTypes.some((type) => type === 'run' || type === 'cycle' || type === 'endurance')
  ) {
    focus = 'endurance';
  }

  const workouts = await Workout.find().lean();
  const matching = workouts.filter((workout) => workout.focus.toLowerCase() === focus);
  const others = workouts.filter((workout) => workout.focus.toLowerCase() !== focus);

  return [...matching, ...others].map((workout) => ({
    ...workout,
    reason:
      focus === 'strength'
        ? 'Matched to your strength activity pattern'
        : focus === 'endurance'
          ? 'Matched to your run/endurance activity pattern'
          : `Matched to your ${focus} fitness goal`,
  }));
}

export { User };
