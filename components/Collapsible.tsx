import { PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';
import { List, Surface } from 'react-native-paper';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  return (
    <Surface style={styles.surface}>
      <List.Accordion
        title={title}
        titleStyle={styles.title}
        style={styles.accordion}
      >
        <Surface style={styles.content}>{children}</Surface>
      </List.Accordion>
    </Surface>
  );
}

const styles = StyleSheet.create({
  surface: {
    // Add any necessary styling for the wrapping Surface if needed
    // By default, List.Accordion might not have a background matching the theme's surface
  },
  accordion: {
    // List.Accordion usually has its own padding, adjust if necessary
    // For example, to remove default padding: paddingHorizontal: 0, paddingVertical: 0
  },
  title: {
    // fontWeight: '600', // Example: If you want to keep the bold title
    // fontSize: 14, // bodyMedium equivalent size, adjust as needed
  },
  content: {
    // Original styling: marginTop: 6, marginLeft: 24,
    // List.Accordion's children are usually indented. Adjust if needed.
    paddingLeft: 0, // Remove default padding if content should not be indented from title
    // marginTop: 6, // Add back if necessary
  },
});
