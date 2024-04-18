import React, { useState } from 'react';
import { IconButton } from 'react-native-paper';
import { Menu } from 'react-native-paper';

const DropdownMenu = () => {
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={
        <IconButton
          icon="plus-circle-outline" // This is a Material Community Icons name, change it as needed
          size={24}
          onPress={openMenu}
        />
      }
      style={{
        marginTop: 50, // Adjust this value to move the menu down
      }}
    >
      <Menu.Item onPress={() => {}} title="New Chat" />
      <Menu.Item onPress={() => {}} title="Add Contacts" />
    </Menu>
  );
};

export default DropdownMenu;
