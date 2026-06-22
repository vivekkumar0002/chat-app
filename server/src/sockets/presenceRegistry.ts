// Tracks which socket connections belong to which user.
// A single user may have multiple active sockets (e.g. several
// browser tabs or devices), so we keep a Set per userId and only
// consider the user "offline" once their last socket disconnects.
//
// NOTE: this is in-memory and per-process. For a multi-instance
// deployment, back this with Redis (e.g. via the socket.io-redis
// adapter) so presence and broadcast events work across instances.
class PresenceRegistry {
  private userSockets = new Map<string, Set<string>>();

  addSocket(userId: string, socketId: string) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);
  }

  // Returns true if this was the user's last active socket (i.e. they are now fully offline)
  removeSocket(userId: string, socketId: string): boolean {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return true;

    sockets.delete(socketId);

    if (sockets.size === 0) {
      this.userSockets.delete(userId);
      return true;
    }
    return false;
  }

  isOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  getSocketIds(userId: string): string[] {
    return Array.from(this.userSockets.get(userId) || []);
  }

  getOnlineUserIds(): string[] {
    return Array.from(this.userSockets.keys());
  }
}

export const presenceRegistry = new PresenceRegistry();
