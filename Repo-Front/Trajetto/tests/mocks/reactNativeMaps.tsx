import React, { forwardRef, useImperativeHandle } from 'react';
import { View } from 'react-native';

const MapView = forwardRef(function MapView(props: { children?: React.ReactNode }, ref) {
  useImperativeHandle(ref, () => ({
    fitToCoordinates: jest.fn(),
    animateToRegion: jest.fn(),
    animateCamera: jest.fn(),
  }));
  return <View testID="map">{props.children}</View>;
});

const Child = ({ children }: { children?: React.ReactNode }) => <View>{children}</View>;

export default MapView;
export const Marker = Child;
export const Polyline = () => null;
export const Circle = () => null;
export const Callout = Child;
export const PROVIDER_DEFAULT = 'default';
export const PROVIDER_GOOGLE = 'google';
