export class Shelter {
  constructor(title, latitude, longitude) {
    this.title = title;
    this.coordinates = {
      latitude: latitude,
      longitude: longitude,
    };
  }
}
