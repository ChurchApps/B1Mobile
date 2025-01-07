# Install script for directory: /Users/vishalsharma/Desktop/development/B1App/node_modules/react-native/ReactAndroid/cmake-utils/default-app-setup

# Set the install prefix
if(NOT DEFINED CMAKE_INSTALL_PREFIX)
  set(CMAKE_INSTALL_PREFIX "/usr/local")
endif()
string(REGEX REPLACE "/$" "" CMAKE_INSTALL_PREFIX "${CMAKE_INSTALL_PREFIX}")

# Set the install configuration name.
if(NOT DEFINED CMAKE_INSTALL_CONFIG_NAME)
  if(BUILD_TYPE)
    string(REGEX REPLACE "^[^A-Za-z0-9_]+" ""
           CMAKE_INSTALL_CONFIG_NAME "${BUILD_TYPE}")
  else()
    set(CMAKE_INSTALL_CONFIG_NAME "Debug")
  endif()
  message(STATUS "Install configuration: \"${CMAKE_INSTALL_CONFIG_NAME}\"")
endif()

# Set the component getting installed.
if(NOT CMAKE_INSTALL_COMPONENT)
  if(COMPONENT)
    message(STATUS "Install component: \"${COMPONENT}\"")
    set(CMAKE_INSTALL_COMPONENT "${COMPONENT}")
  else()
    set(CMAKE_INSTALL_COMPONENT)
  endif()
endif()

# Install shared libraries without execute permission?
if(NOT DEFINED CMAKE_INSTALL_SO_NO_EXE)
  set(CMAKE_INSTALL_SO_NO_EXE "0")
endif()

# Is this installation the result of a crosscompile?
if(NOT DEFINED CMAKE_CROSSCOMPILING)
  set(CMAKE_CROSSCOMPILING "TRUE")
endif()

# Set default install directory permissions.
if(NOT DEFINED CMAKE_OBJDUMP)
  set(CMAKE_OBJDUMP "/Users/vishalsharma/Library/Android/sdk/ndk/26.1.10909125/toolchains/llvm/prebuilt/darwin-x86_64/bin/llvm-objdump")
endif()

if(NOT CMAKE_INSTALL_LOCAL_ONLY)
  # Include the install script for each subdirectory.
  include("/Users/vishalsharma/Desktop/development/B1App/android/app/.cxx/Debug/60665053/armeabi-v7a/rnasyncstorage_autolinked_build/cmake_install.cmake")
  include("/Users/vishalsharma/Desktop/development/B1App/android/app/.cxx/Debug/60665053/armeabi-v7a/RNDateTimePickerCGen_autolinked_build/cmake_install.cmake")
  include("/Users/vishalsharma/Desktop/development/B1App/android/app/.cxx/Debug/60665053/armeabi-v7a/RNDatePickerSpecs_autolinked_build/cmake_install.cmake")
  include("/Users/vishalsharma/Desktop/development/B1App/android/app/.cxx/Debug/60665053/armeabi-v7a/rngesturehandler_codegen_autolinked_build/cmake_install.cmake")
  include("/Users/vishalsharma/Desktop/development/B1App/android/app/.cxx/Debug/60665053/armeabi-v7a/pagerview_autolinked_build/cmake_install.cmake")
  include("/Users/vishalsharma/Desktop/development/B1App/android/app/.cxx/Debug/60665053/armeabi-v7a/rnreanimated_autolinked_build/cmake_install.cmake")
  include("/Users/vishalsharma/Desktop/development/B1App/android/app/.cxx/Debug/60665053/armeabi-v7a/safeareacontext_autolinked_build/cmake_install.cmake")
  include("/Users/vishalsharma/Desktop/development/B1App/android/app/.cxx/Debug/60665053/armeabi-v7a/rnscreens_autolinked_build/cmake_install.cmake")
  include("/Users/vishalsharma/Desktop/development/B1App/android/app/.cxx/Debug/60665053/armeabi-v7a/RNVectorIconsSpec_autolinked_build/cmake_install.cmake")
  include("/Users/vishalsharma/Desktop/development/B1App/android/app/.cxx/Debug/60665053/armeabi-v7a/RNCWebViewSpec_autolinked_build/cmake_install.cmake")

endif()

if(CMAKE_INSTALL_COMPONENT)
  set(CMAKE_INSTALL_MANIFEST "install_manifest_${CMAKE_INSTALL_COMPONENT}.txt")
else()
  set(CMAKE_INSTALL_MANIFEST "install_manifest.txt")
endif()

string(REPLACE ";" "\n" CMAKE_INSTALL_MANIFEST_CONTENT
       "${CMAKE_INSTALL_MANIFEST_FILES}")
file(WRITE "/Users/vishalsharma/Desktop/development/B1App/android/app/.cxx/Debug/60665053/armeabi-v7a/${CMAKE_INSTALL_MANIFEST}"
     "${CMAKE_INSTALL_MANIFEST_CONTENT}")
