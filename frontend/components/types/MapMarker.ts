/**
 * For use in marker-related logic, as it has marker-related information
 */
export type MapMarker = {
  displayName: string;
  latitude: number;
  longitude: number;
  numId: number;
  imgUrl: string;
  infoUrl: string;
  discription: string;
  isToggled: boolean;
}