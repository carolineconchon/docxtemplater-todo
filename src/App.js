import {
	Button,
	Container,
	Text,
	Title,
	Modal,
	TextInput,
	Group,
	Card,
	ActionIcon,
	Code,
} from '@mantine/core';
import { useState, useRef, useEffect } from 'react';
import { MoonStars, Sun, Trash } from 'tabler-icons-react';
// import Docxtemplater to use it in the component 
import Docxtemplater from 'docxtemplater';
//other dependencies
import {saveAs} from 'file-saver';
import PizZip from 'pizzip';
import PizZipUtils from 'pizzip/utils/index.js'


import {
	MantineProvider,
	ColorSchemeProvider,
	ColorScheme,
} from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { useHotkeys, useLocalStorage } from '@mantine/hooks';

function loadFile(url, callback) {
	PizZipUtils.getBinaryContent(url, callback);
  } 

export default function App() {
	const [tasks, setTasks] = useState([]);
	const [opened, setOpened] = useState(false);

	const preferredColorScheme = useColorScheme();
	const [colorScheme, setColorScheme] = useLocalStorage({
		key: 'mantine-color-scheme',
		defaultValue: 'light',
		getInitialValueInEffect: true,
	});
	const toggleColorScheme = value =>
		setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

	useHotkeys([['mod+J', () => toggleColorScheme()]]);

	const taskTitle = useRef('');
	const taskSummary = useRef('');

	function createTask() {
		setTasks([
			...tasks,
			{
				title: taskTitle.current.value,
				summary: taskSummary.current.value,
			},
		]);

		saveTasks([
			...tasks,
			{
				title: taskTitle.current.value,
				summary: taskSummary.current.value,
			},
		]);
	}

	function deleteTask(index) {
		var clonedTasks = [...tasks];

		clonedTasks.splice(index, 1);

		setTasks(clonedTasks);

		saveTasks([...clonedTasks]);
	}

	function loadTasks() {
		let loadedTasks = localStorage.getItem('tasks');

		let tasks = JSON.parse(loadedTasks);

		if (tasks) {
			setTasks(tasks);
		}
	}

	function saveTasks(tasks) {
		localStorage.setItem('tasks', JSON.stringify(tasks));
	}

	useEffect(() => {
		loadTasks();
	}, []);

		// docx exportation function
	function exportTasksToDocx(tasks) {
		// Load the Word template
		loadFile('https://docxtemplater.com/tasks-template.docx', function (error, content) {
		  if (error) {
			console.error(error);
			return;
		  }
	  
		  const zip = new PizZip(content);
		  const doc = new Docxtemplater().loadZip(zip);
	  
		  // Define the data to be inserted into the template
		  const data = {
			tasks: tasks.map((task, index) => ({
			  title: task.title,
			  //if summary is empty/null write the message
			  summary: task.summary || 'No summary available',
			})),
		  };
	  
		  // Apply the data to the template
		  doc.setData(data);
	  
		  // Render the document 
		  try {
			doc.render();
		  } catch (error) {
			console.error(error);
			return;
		  }
	  
		  // Generate the final docx file
		  const output = doc.getZip().generate({
			type: 'blob',
			mimeType:
			  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		  });
	  
		  // Save the file
		  saveAs(output, 'tasks.docx');
		});
	  }

	return (
		<ColorSchemeProvider
			colorScheme={colorScheme}
			toggleColorScheme={toggleColorScheme}>
			<MantineProvider
				theme={{ colorScheme, defaultRadius: 'md' }}
				withGlobalStyles
				withNormalizeCSS>
				<div className='App'>
					<Modal
						opened={opened}
						size={'md'}
						title={'New Task'}
						withCloseButton={false}
						onClose={() => {
							setOpened(false);
						}}
						centered>
						<TextInput
							mt={'md'}
							ref={taskTitle}
							placeholder={'Task Title'}
							required
							label={'Title'}
						/>
						<TextInput
							ref={taskSummary}
							mt={'md'}
							placeholder={'Task Summary'}
							label={'Summary'}
						/>
						<Group mt={'md'} position={'apart'}>
							<Button
								onClick={() => {
									setOpened(false);
								}}
								variant={'subtle'}>
								Cancel
							</Button>
							<Button
								onClick={() => {
									createTask();
									setOpened(false);
								}}>
								Create Task
							</Button>
						</Group>
					</Modal>
					<Container size={550} my={40}>
						<Group position={'apart'}>
							<Title
								sx={theme => ({
									fontFamily: `Greycliff CF, ${theme.fontFamily}`,
									fontWeight: 900,
								})}>
								My Tasks
							</Title>
							<ActionIcon
								color={'blue'}
								onClick={() => toggleColorScheme()}
								size='lg'>
								{colorScheme === 'dark' ? (
									<Sun size={16} />
								) : (
									<MoonStars size={16} />
								)}
							</ActionIcon>
						</Group>
						{tasks.length > 0 ? (
							tasks.map((task, index) => {
								if (task.title) {
									return (
										<Card withBorder key={index} mt={'sm'}>
											<Group position={'apart'}>
												<Text weight={'bold'}>{task.title}</Text>
												<ActionIcon
													onClick={() => {
														deleteTask(index);
													}}
													color={'red'}
													variant={'transparent'}>
													<Trash />
												</ActionIcon>
											</Group>
											<Text color={'dimmed'} size={'md'} mt={'sm'}>
												{task.summary
													? task.summary
													: 'No summary was provided for this task'}
											</Text>
										</Card>
									);
								}
							})
						) : (
							<Text size={'lg'} mt={'md'} color={'dimmed'}>
								You have no tasks
							</Text>
						)}
						<Button
							onClick={() => {
								setOpened(true);
							}}
							fullWidth
							mt={'md'}>
							New Task
						</Button>
						<Button
  							onClick={() => {
    							exportTasksToDocx(tasks);
 							 }}
							  style={{
								display: 'block',
								margin: '20px auto', 
							  }}
						>
  							Export tasks list
						</Button>
					</Container>
				</div>
			</MantineProvider>
		</ColorSchemeProvider>
	);
}
