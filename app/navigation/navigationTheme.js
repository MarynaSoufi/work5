import { DefaultTheme } from '@react-navigation/native';
import color from '../config/colors';

export default {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: color.green,
    background: color.white,
  }
}
