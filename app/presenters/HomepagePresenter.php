<?php

namespace App\Presenters;

use Nette;
use App\Model;
use Kdyby\RabbitMq;


class HomepagePresenter extends BasePresenter
{
	/** @var RabbitMq\Connection */
	private $rabbit;

	public function injectRabbit (RabbitMq\Connection $rabbit)
	{
		$this->rabbit = $rabbit;
	}

	public function renderDefault()
	{
		$this->template->anyVariable = 'any value';
	}

	protected function createComponentSubmitForm ()
	{
		$form = new Nette\Application\UI\Form();
		$form->addText('env', 'Environment');
		$form->addSubmit('submit', 'Submit');
		$form->onSuccess[] = $this->submitFormSuccess;

		return $form;
	}

	public function submitFormSuccess (Nette\Application\UI\Form $form)
	{
		$values = $form->getValues();
		$producer = $this->rabbit->getProducer('tasks');

		$producer->publish(sprintf("Hello from %s", $values->env), $values->env);

		$this->flashMessage('Submitted');
		$this->redirect('this');
	}
}
